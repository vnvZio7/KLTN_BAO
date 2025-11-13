// services/doctorMatcherAIFromList.js
import Groq from "groq-sdk";
import Doctor from "../models/doctor.model.js";
import { getTestsMaxScores } from "./helper.js";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sum = (arr) =>
  Array.isArray(arr) ? arr.reduce((a, b) => a + (b || 0), 0) : 0;

function safeParseJSON(s) {
  try {
    const a = s.indexOf("{"),
      b = s.lastIndexOf("}");
    if (a === -1 || b === -1) throw new Error();
    return JSON.parse(s.slice(a, b + 1));
  } catch {
    return null;
  }
}

function cal(score, max) {
  return ((score / max) * 100).toFixed(2);
}

async function matchDoctorsAIOnly(req, res) {
  const container = req.body?.payload || body || {};
  const tests = Array.isArray(container.tests) ? container.tests : [];
  const topK = 6;

  if (!tests.length) {
    res.json({ needDoctor: false, message: "Không có dữ liệu bài test." });
  }

  // 1) Tổng điểm từng test từ client
  const totals = {};
  const codes = [];
  for (const t of tests) {
    if (!t?.code) continue;
    codes.push(t.code);
    totals[t.code] = sum(t.scores || []);
  }

  // 2) Lấy maxScore từng test từ DB
  const maxMap = await getTestsMaxScores(codes); // { code: max }

  // 6) Block mô tả điểm (mỗi test và tổng toàn bộ)
  const testsBlock = codes
    .map((c) => `- ${c}: ${cal(totals[c], maxMap[c])}%`)
    .join("\n");
  console.log(testsBlock);

  console.log(totals);

  // 4) Chuẩn bị danh sách bác sĩ (ưu tiên dùng doctorsOverride nếu có)
  const doctors = await Doctor.find({}).lean();

  if (!doctors.length) {
    res.json({
      needDoctor: true,
      allTests: codes.map((c) => ({
        code: c,
        score: totals[c] ?? 0,
        maxPossible: maxMap[c] ?? 0,
      })),
      doctor_ids: [],
      doctors: [],
      reason: "Không có dữ liệu bác sĩ trong hệ thống.",
    });
  }

  // 5) Gói dữ liệu bác sĩ gọn cho AI
  const doctorLines = doctors
    .map((d) =>
      [
        `id: ${d._id}`,
        `Role:${d.role || ""}`, // counselor/therapist/psychiatrist
        `Chuyên môn: ${(d.specializations || []).join(", ")}`,
        `Phương pháp: ${(d.modalities || []).join(", ")}`,
        `Số năm kinh nghiệm: ${d.yearsExperience ?? 0}`,
      ].join(" | ")
    )
    .join("\n");

  const prompt = `
Bạn là hệ thống gợi ý bác sĩ trị liệu. Hãy chọn các bác sĩ phù hợp nhất dựa trên **tỉ lệ điểm từng bài test (điểm/tối đa)** và danh sách bác sĩ bên dưới.

Điểm người dùng:
${testsBlock}

QUY TẮC BẮT BUỘC:
- Xác định bài test có % cao nhất là **TRỌNG TÂM** (ví dụ: nếu PHQ-9 cao nhất → trọng tâm là "trầm cảm"; nếu GAD-7 cao nhất → "lo âu".
- Nếu **cả hai % đều cao và gần nhau** (chênh lệch ≤ 10 điểm phần trăm), **ưu tiên bác sĩ nhiều năm kinh nghiệm (≥7 năm)** và **có cả hai nhóm chuyên môn liên quan** (ví dụ: trầm cảm **và** lo âu).
- **Chỉ chọn** những bác sĩ có **specializations** khớp với **TRỌNG TÂM** (và nếu “cùng cao” thì **khớp cả hai** nhóm chuyên môn). Nếu không có ai khớp, trả về:
  { "doctor_ids": [], "reason": "Không có bác sĩ khớp chuyên môn trọng tâm." }
- Tối đa **${topK}** bác sĩ.
- Thứ tự sắp xếp: **phù hợp chuyên môn** (khớp từ khóa trọng tâm) → **Years** (nhiều năm kinh nghiệm hơn đứng trước) → **Rating**.
- Các **ID** phải nằm trong danh sách bác sĩ cung cấp bên dưới.

Danh sách bác sĩ (mỗi dòng là 1 bác sĩ):
${doctorLines}

Chỉ trả về JSON **thuần** đúng schema, KHÔNG thêm chữ nào khác:
{
  "doctor_ids": ["<ObjectId>", "<ObjectId>", ...],  
  "reason": "Giải thích ngắn gọn 25–30 chữ bằng tiếng Việt, nêu rõ bài test nào % cao hơn hoặc cả hai đều cao và phù hợp với bác sĩ có chuyên môn gì"
}
`.trim();

  // 7) Gọi Groq
  let raw = "";
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Luôn trả về JSON hợp lệ đúng schema, không thêm bất kỳ chữ nào khác.",
        },
        { role: "user", content: prompt },
      ],
    });
    raw = completion?.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    console.error("Groq error:", e?.response?.data || e);
    res.json({
      needDoctor: true,
      allTests: codes.map((c) => ({
        code: c,
        score: totals[c] ?? 0,
        maxPossible: maxMap[c] ?? 0,
      })),
      doctor_ids: [],
      doctors: [],
      reason: "Lỗi gọi AI Groq.",
    });
  }

  // 8) Parse JSON & lọc ID hợp lệ
  const parsed = safeParseJSON(raw) || {
    doctor_ids: [],
    reason: "Không parse được JSON từ AI.",
  };
  console.log(parsed);
  const doctor_ids = Array.isArray(parsed.doctor_ids)
    ? parsed.doctor_ids.slice(0, topK)
    : [];

  // 9) Lấy thông tin bác sĩ theo IDs (dùng mảng có sẵn nếu có)
  let selectedDoctors = [];
  if (doctor_ids.length) {
    selectedDoctors = await Doctor.find({ _id: { $in: doctor_ids } })
      .populate("accountId")
      .lean();
  }

  // 10) Trả kết quả
  res.json({
    needDoctor: true,
    allTests: codes.map((c) => ({
      code: c,
      score: totals[c] ?? 0,
      maxPossible: maxMap[c] ?? 0,
    })),
    doctor_ids,
    doctors: selectedDoctors,
    reason: parsed.reason || "",
  });
}

export { matchDoctorsAIOnly };
