// services/doctorMatcherAIFromList.js
import Groq from "groq-sdk";
import Doctor from "../models/doctor.model.js";
import Test from "../models/test.model.js";
import ExerciseTemplate from "../models/exerciseTemplate.model.js";
import dotenv from "dotenv";
import { gadBand, phqBand, pickSuggestedRole } from "./helper.js";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sum = (arr) =>
  Array.isArray(arr) ? arr.reduce((a, b) => a + (b || 0), 0) : 0;

// function safeParseJSON(s) {
//   try {
//     const a = s.indexOf("{"),
//       b = s.lastIndexOf("}");
//     if (a === -1 || b === -1) throw new Error();
//     return JSON.parse(s.slice(a, b + 1));
//   } catch {
//     return null;
//   }
// }

function safeParseJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();

  // Nếu model trả về dạng ```json ... ```
  if (cleaned.startsWith("```")) {
    // bỏ dòng ```json hoặc ``` ở đầu
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*?\n/, "");
    // bỏ ``` ở cuối
    cleaned = cleaned.replace(/```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // fallback: cố gắng bắt đoạn {...} đầu tiên
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

async function matchDoctorsAIOnly(req, res) {
  try {
    const container = req.body?.payload || body || {};
    const tests = Array.isArray(container.tests) ? container.tests : [];
    const answers = tests[2].answers;
    console.log(answers);
    const topK = 6;

    if (!tests.length) {
      res.json({ needDoctor: false, message: "Không có dữ liệu bài test." });
    }

    const phqScore = sum(tests[0].scores);
    const gadScore = sum(tests[1].scores);
    if (phqScore === undefined || gadScore === undefined) {
      return res.status(400).json({ message: "Missing phqScore or gadScore" });
    }
    if (phqScore <= 4 && gadScore <= 4) {
      return res.json({
        needDoctor: false,
        reason:
          "Điểm PHQ-9 và GAD-7 đều nằm trong mức bình thường. Bạn chưa cần gặp bác sĩ.",
        doctors: [],
      });
    }

    // 1. Tính mức độ của 2 test
    const phqLevel = phqBand(phqScore);
    const gadLevel = gadBand(gadScore);

    // 2. Chọn role gợi ý dựa trên test trội
    const { dominant, role } = pickSuggestedRole(phqScore, gadScore);

    console.log("Dominant test:", dominant);
    console.log("Suggested role:", role);
    // 3. Tìm bác sĩ phù hợp
    const spec = dominant === "PHQ-9" ? "Trầm cảm" : "Lo âu";
    const doctors = await Doctor.find({
      specializations: { $in: [spec] },
      role,
      "approval.status": "approved",
    })
      .populate("accountId")
      .select("-password")
      .sort({
        yearsExperience: -1, // Sắp xếp theo kinh nghiệm từ cao đến thấp
        rating: -1, // Sắp xếp theo đánh giá từ cao đến thấp
        pricePerWeek: 1, // Sắp xếp theo giá từ thấp đến cao (nếu cần)
      });

    if (!doctors.length) {
      res.status(200).json({
        reason: "Không tìm thấy bác sĩ phù hợp với mức độ hiện tại.",
        phqLevel,
        gadLevel,
        spec,
        role,
        doctors: [],
      });
    }
    // 4. Lấy bộ test THERAPY_MATCH từ DB để map answers -> modalities
    const therapyTestDoc = await Test.findOne({ code: "THERAPY_MATCH" }).lean();

    let sortedTherapies = [];
    let therapyDetails = [];

    if (therapyTestDoc && Array.isArray(therapyTestDoc.questions)) {
      const questions = therapyTestDoc.questions;

      const results = [];
      const therapyCount = {};

      answers.forEach((answerIdx, questionIdx) => {
        const q = questions[questionIdx];
        if (!q) return;

        const optionLabel = q.options?.[answerIdx];
        if (!optionLabel) return;

        const therapies = q.mapping?.[optionLabel] || [];

        results.push({
          questionIndex: questionIdx,
          optionIndex: answerIdx,
          optionLabel,
          therapies,
        });

        therapies.forEach((t) => {
          therapyCount[t] = (therapyCount[t] || 0) + 1;
        });
      });

      sortedTherapies = Object.entries(therapyCount)
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => ({ code, count }));

      therapyDetails = results;
    }
    const doctorLines = doctors
      .map((d) =>
        [
          `id: ${d._id}`,
          `Role:${d.role || ""}`, // counselor/therapist/psychiatrist
          `Chuyên môn: ${(d.specializations || []).join(", ")}`,
          `Phương pháp: ${(d.modalities || []).join(", ")}`,
          `Số năm kinh nghiệm: ${d.yearsExperience ?? 0}`,
          `Đánh giá: ${d.rating ?? 0}`,
        ].join(" | ")
      )
      .join("\n");
    console.log(sortedTherapies);
    const therapyBlock =
      sortedTherapies.length > 0
        ? `Các phương pháp trị liệu ưu tiên (từ THERAPY_MATCH, sắp xếp theo tần suất giảm dần):
${sortedTherapies
  .map((t) => `- ${t.code}: ${t.count} lần được gợi ý`)
  .join("\n")}`
        : "Không có ưu tiên phương pháp rõ ràng từ bộ THERAPY_MATCH.";

    const prompt = `
Bạn là hệ thống gợi ý bác sĩ trị liệu tâm lý cho bệnh nhân.

Dữ liệu bệnh nhân:
Trọng tâm hiện tại: ${spec}

${therapyBlock}

Danh sách bác sĩ (mỗi dòng là một bác sĩ, vui lòng dùng đúng id):
${doctorLines}

YÊU CẦU:
- Kết hợp:
  - Mức độ PHQ-9, GAD-7 và trọng tâm (Trầm cảm/Lo âu).
  - Các phương pháp trị liệu ưu tiên từ THERAPY_MATCH (sortedTherapies ở trên).
  - Thông tin bác sĩ: specializations, modalities, worksWithSeverity, yearsExperience, rating, pricePerWeek.
- Chọn tối đa ${topK} bác sĩ.
- Ưu tiên:
  1) Bác sĩ có modalities (phương pháp trị liệu) trùng với các phương pháp ưu tiên.
  2) Bác sĩ có specializations phù hợp với trọng tâm (Trầm cảm/Lo âu).
  3) Bác sĩ làm việc với đúng mức độ nặng hiện tại (worksWithSeverity).
  4) Nhiều năm kinh nghiệm hơn và rating cao hơn.
- Nếu không thấy ai thực sự phù hợp, vẫn chọn những người gần phù hợp nhất nhưng ghi rõ lý do.

TRẢ VỀ:
Chỉ trả về JSON **thuần** đúng schema, không thêm chữ nào khác:
{
  "doctor_ids": ["<ObjectId1>", "<ObjectId2>", ...],
  "reason": "Giải thích ngắn gọn 25–40 chữ bằng tiếng Việt, nêu rõ vì sao nhóm bác sĩ này phù hợp dựa trên mức độ và phương pháp trị liệu ưu tiên."
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
        phqLevel,
        gadLevel,
        spec,
        role,
        suggestedTherapies: sortedTherapies,
        doctors: [],
        reason: "Lỗi gọi AI Groq.",
      });
    }

    //   // 8) Parse JSON & lọc ID hợp lệ
    const parsed = safeParseJSON(raw) || {
      doctor_ids: [],
      reason: "Không parse được JSON từ AI.",
    };
    //   console.log(parsed);

    if (!parsed || !Array.isArray(parsed.doctor_ids)) {
      console.error("Groq output is not valid JSON:", raw);
      return res.json({
        needDoctor: true,
        phqLevel,
        gadLevel,
        spec,
        role,
        suggestedTherapies: sortedTherapies,
        doctors, // fallback
        reason:
          "Không parse được JSON từ AI, sử dụng danh sách bác sĩ đã lọc sẵn.",
        rawGroq: raw,
      });
    }
    const doctor_ids = Array.isArray(parsed.doctor_ids)
      ? parsed.doctor_ids.slice(0, topK).map(String)
      : [];
    const doctorMap = new Map(doctors.map((d) => [String(d._id), d]));
    const selectedDoctors = doctor_ids
      .map((id) => {
        const doc = doctorMap.get(id);
        if (!doc) return null;
        return doc;
      })
      .filter(Boolean);
    // ------------------- GỢI Ý BÀI TẬP BẰNG GROQ -------------------

    // Lấy các phương pháp ưu tiên (top 3) để map với field method của bài tập
    const preferredMethods = sortedTherapies
      .slice(0, 3)
      .map((t) => t.code)
      .filter(Boolean);

    // Map spec -> targetSymptoms trong ExerciseTemplate (không dấu)
    const symptomKey = dominant === "PHQ-9" ? "Tram cam" : "Lo au";

    // Query bài tập phù hợp sơ bộ
    let exerciseQuery = {};
    if (preferredMethods.length) {
      exerciseQuery.method = { $in: preferredMethods };
    }
    exerciseQuery.targetSymptoms = { $in: [symptomKey] };

    let exercises = await ExerciseTemplate.find(exerciseQuery).limit(20).lean();

    // Nếu không tìm được bài nào, relax filter: chỉ theo symptoms
    if (!exercises.length) {
      exercises = await ExerciseTemplate.find({
        targetSymptoms: { $in: [symptomKey] },
      })
        .limit(20)
        .lean();
    }

    // Nếu vẫn không có thì lấy random 10 bài cho AI chọn tạm
    if (!exercises.length) {
      exercises = await ExerciseTemplate.find().limit(10).lean();
    }

    const exerciseLines = exercises
      .map((ex) =>
        [
          `id: ${ex._id}`,
          `Tiêu đề: ${ex.title}`,
          `Phương pháp: ${ex.method || ""}`, // CBT, ACT...
          `Triệu chứng mục tiêu: ${(ex.targetSymptoms || []).join(", ")}`,
          `Độ khó: ${ex.difficulty || ""}`,
          `Thời lượng ước tính: ${ex.estimatedMinutes || 0} phút`,
          `Nội dung rút gọn: ${(ex.content || "")
            .slice(0, 250)
            .replace(/\s+/g, " ")}...`,
        ].join(" | ")
      )
      .join("\n");

    const exercisePrompt = `
Bạn là hệ thống gợi ý BÀI TẬP TÂM LÝ cho bệnh nhân dựa trên tình trạng và phương pháp trị liệu.

DỮ LIỆU BỆNH NHÂN:
- Trọng tâm: ${spec}
- Mức độ PHQ-9: ${phqLevel} (điểm: ${phqScore})
- Mức độ GAD-7: ${gadLevel} (điểm: ${gadScore})

${therapyBlock}

DANH SÁCH BÀI TẬP (mỗi dòng là một bài, dùng đúng id):
${exerciseLines}

YÊU CẦU:
- Chọn tối đa 2 bài tập phù hợp nhất với:
  1) Trọng tâm (Trầm cảm/Lo âu).
  2) Các phương pháp trị liệu ưu tiên (CBT, ACT, BA, v.v.).
  3) Độ khó phù hợp (ưu tiên easy/medium cho người mới).
  4) Thời lượng hợp lý (20–40 phút là lý tưởng, nhưng có thể linh hoạt).
- Các bài tập nên giúp bệnh nhân bắt đầu thực hành ngay sau khi hoàn thành bài test.

TRẢ VỀ:
Chỉ trả về JSON **thuần** đúng schema, không thêm chữ nào khác:
{
  "exercise_ids": ["<ObjectId1>", "<ObjectId2>"],
  "reason": "Giải thích ngắn gọn 20–40 chữ bằng tiếng Việt, nói rõ vì sao 2 bài tập này phù hợp với mức độ và phương pháp trị liệu ưu tiên."
}
`.trim();

    let rawExercise = "";
    let parsedExercise = { exercise_ids: [], reason: "" };
    try {
      const completionEx = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.15,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "Luôn trả về JSON hợp lệ đúng schema, không thêm bất kỳ chữ nào khác.",
          },
          { role: "user", content: exercisePrompt },
        ],
      });

      rawExercise = completionEx?.choices?.[0]?.message?.content ?? "";
      parsedExercise = safeParseJSON(rawExercise) || parsedExercise;
    } catch (e) {
      console.error("Groq error (exercise):", e?.response?.data || e);
    }

    let selectedExercises = [];
    if (Array.isArray(parsedExercise.exercise_ids)) {
      const exerciseIds = parsedExercise.exercise_ids
        .slice(0, 2)
        .map((id) => String(id));
      const exMap = new Map(exercises.map((ex) => [String(ex._id), ex]));
      selectedExercises = exerciseIds
        .map((id) => exMap.get(id))
        .filter(Boolean);
    }

    // fallback: nếu AI không chọn được hoặc sai format thì chọn 1–2 bài đầu
    if (!selectedExercises.length && exercises.length) {
      selectedExercises = exercises.slice(0, 2);
      if (!parsedExercise.reason) {
        parsedExercise.reason =
          "Tạm chọn 1–2 bài tập phù hợp với triệu chứng chính và mức độ hiện tại.";
      }
    }
    return res.status(200).json({
      needDoctor: true,
      phqLevel,
      gadLevel,
      spec,
      role,
      suggestedTherapies: sortedTherapies,
      reason: parsed.reason || "",
      doctors: selectedDoctors,
      suggestedExercises: selectedExercises,
    });
    //   // 9) Lấy thông tin bác sĩ theo IDs (dùng mảng có sẵn nếu có)
    //   let selectedDoctors = [];
    //   if (doctor_ids.length) {
    //     selectedDoctors = await Doctor.find({ _id: { $in: doctor_ids } })
    //       .populate("accountId")
    //       .lean();
    //   }

    // 10) Trả kết quả
    // res.json({
    //   needDoctor: true,
    //   allTests: codes.map((c) => ({
    //     code: c,
    //     score: totals[c] ?? 0,
    //     maxPossible: maxMap[c] ?? 0,
    //   })),
    //   doctor_ids,
    //   doctors: selectedDoctors,
    // });
    // res.status(200).json({
    //   needDoctor: true,
    //   phqLevel,
    //   gadLevel,
    //   reason: parsed.reason || "",
    //   doctors: trimmed,
    // });
  } catch (error) {
    console.error("matchDoctorsAIOnly error:", error);
    return res
      .status(500)
      .json({ message: "Match doctors AI failed.", error: error.message });
  }
}

export { matchDoctorsAIOnly };
