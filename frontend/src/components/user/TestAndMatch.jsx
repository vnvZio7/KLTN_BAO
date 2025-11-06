// src/pages/TestAndMatch.jsx
import React, { useMemo, useState } from "react";

const PHQ9 = [
  "Ít hứng thú hay niềm vui khi làm việc",
  "Cảm thấy buồn bã, chán nản hoặc tuyệt vọng",
  "Khó ngủ, ngủ không yên hoặc ngủ quá nhiều",
  "Mệt mỏi hoặc thiếu năng lượng",
  "Chán ăn hoặc ăn quá nhiều",
  "Tự ti — cảm thấy mình thất bại hoặc làm phiền người khác",
  "Khó tập trung (đọc báo, xem TV, làm việc...)",
  "Vận động / nói chậm chạp hoặc bồn chồn (người khác có thể nhận ra)",
  "Nghĩ rằng thà chết hoặc tự làm tổn thương bản thân",
];

const GAD7 = [
  "Cảm thấy lo lắng, căng thẳng hoặc bồn chồn",
  "Không thể ngừng hoặc kiểm soát lo lắng",
  "Lo lắng quá mức về nhiều vấn đề khác nhau",
  "Khó thư giãn",
  "Bồn chồn đến mức khó ngồi yên",
  "Dễ cáu gắt hoặc khó chịu",
  "Cảm giác sợ hãi như có điều tồi tệ sắp xảy ra",
];

const OPTIONS = [
  { v: 0, label: "Không bao giờ (0)" },
  { v: 1, label: "Vài ngày (1)" },
  { v: 2, label: "Hơn nửa số ngày (2)" },
  { v: 3, label: "Gần như mỗi ngày (3)" },
];

// Mock danh sách bác sĩ (thực tế bạn fetch từ server)
const DOCTORS = [
  {
    id: "d1",
    fullName: "BS. A",
    role: "Counselor",
    specialization: ["Lo âu"],
    bio: "Counseling, CBT",
  },
  {
    id: "d2",
    fullName: "ThS. B",
    role: "Therapist",
    specialization: ["Trầm cảm", "CBT"],
    bio: "CBT/ACT 7 năm",
  },
  {
    id: "d3",
    fullName: "BS. C",
    role: "Psychiatrist",
    specialization: ["Rối loạn khí sắc"],
    bio: "Tâm thần học 10 năm",
  },
  {
    id: "d4",
    fullName: "CN. D",
    role: "Counselor",
    specialization: ["Stress", "Mất ngủ"],
    bio: "Tham vấn ngắn hạn",
  },
  {
    id: "d5",
    fullName: "ThS. E",
    role: "Therapist",
    specialization: ["Lo âu", "Ám ảnh"],
    bio: "Trị liệu nhận thức",
  },
];

function phqBand(score) {
  if (score <= 4) return { band: "Bình thường", role: "None" };
  if (score <= 9) return { band: "Nhẹ", role: "Counselor" };
  if (score <= 14) return { band: "Trung bình", role: "Therapist" };
  return { band: "Nặng", role: "Psychiatrist" };
}
function gadBand(score) {
  if (score <= 4) return { band: "Bình thường", role: "None" };
  if (score <= 9) return { band: "Nhẹ", role: "Counselor" };
  if (score <= 14) return { band: "Trung bình", role: "Therapist" };
  return { band: "Nặng", role: "Psychiatrist" };
}

export default function TestAndMatch() {
  const [step, setStep] = useState(1); // 1: Test -> 2: Chọn bác sĩ -> 3: Xem lại & Gửi
  const totalSteps = 4;

  const [phq, setPhq] = useState(Array(PHQ9.length).fill(null));
  const [gad, setGad] = useState(Array(GAD7.length).fill(null));
  const [pickedDoctorId, setPickedDoctorId] = useState(null);

  const phqScore = useMemo(() => phq.reduce((s, n) => s + (n ?? 0), 0), [phq]);
  const gadScore = useMemo(() => gad.reduce((s, n) => s + (n ?? 0), 0), [gad]);

  // Quyết định nhóm theo điểm cao hơn
  const dominant = useMemo(
    () => (phqScore >= gadScore ? "PHQ9" : "GAD7"),
    [phqScore, gadScore]
  );
  const recommendation = useMemo(() => {
    const band = dominant === "PHQ9" ? phqBand(phqScore) : gadBand(gadScore);
    return band; // {band, role}
  }, [dominant, phqScore, gadScore]);

  const filteredDoctors = useMemo(() => {
    if (recommendation.role === "None") return []; // không cần bác sĩ
    return DOCTORS.filter((d) => d.role === recommendation.role);
  }, [recommendation.role]);

  const progress = Math.round((step / totalSteps) * 100);

  const validateStep1 = () => phq.every((v) => v !== null);
  const validateStep2 = () => gad.every((v) => v !== null);
  const validateStep3 = () =>
    !!pickedDoctorId || recommendation.role === "None";

  const goNext = () => {
    if (step === 1 && !validateStep1())
      return alert("Vui lòng trả lời đầy đủ PHQ-9.");
    if (step === 2 && !validateStep2())
      return alert("Vui lòng trả lời đầy đủ GAD-7.");
    if (step === 3 && !validateStep3())
      return alert("Vui lòng chọn một bác sĩ.");
    setStep((s) => Math.min(totalSteps, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const submitAll = async () => {
    const payload = {
      phq9: { answers: phq, score: phqScore, band: phqBand(phqScore).band },
      gad7: { answers: gad, score: gadScore, band: gadBand(gadScore).band },
      dominant,
      suggestedRole: recommendation.role,
      doctorId: pickedDoctorId || null,
    };
    // 👉 Gắn API thật tại đây:
    // const res = await fetch("/api/screening/submit-and-match", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    //   body: JSON.stringify(payload),
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message || "Gửi thất bại")
    console.log("SUBMIT:", payload);
    alert("Đã gửi bài test & lựa chọn bác sĩ (demo).");
  };

  const Card = ({ children }) => (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
      {children}
    </div>
  );

  const RadioMatrix = ({ items, values, onChange, title }) => (
    <Card>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-4">
        {items.map((q, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-800 mb-3">
              {idx + 1}. {q}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {OPTIONS.map((op) => (
                <label
                  key={op.v}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition
                    ${
                      values[idx] === op.v
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <input
                    type="radio"
                    name={`${title}_${idx}`}
                    className="accent-teal-600"
                    checked={values[idx] === op.v}
                    onChange={() => {
                      const next = [...values];
                      next[idx] = op.v;
                      onChange(next);
                    }}
                  />
                  <span className="text-sm text-gray-700">{op.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header + progress */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Bài test & ghép bác sĩ
          </h1>
          <span className="text-sm text-gray-500">
            Bước {step}/{totalSteps}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 1: Test */}
        {step === 1 && (
          <div className="space-y-6">
            <RadioMatrix
              items={PHQ9}
              values={phq}
              onChange={setPhq}
              title="PHQ-9 (Trầm cảm)"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <RadioMatrix
              items={GAD7}
              values={gad}
              onChange={setGad}
              title="GAD-7 (Lo âu)"
            />
          </div>
        )}

        {/* Step 2: Danh sách bác sĩ (theo role đề xuất) */}
        {step === 3 && (
          <Card>
            {recommendation.role === "None" ? (
              <div className="text-gray-800">
                <p className="font-semibold mb-2">
                  Bạn thuộc mức “Bình thường”.
                </p>
                <p className="text-sm text-gray-600">
                  Chưa cần gặp chuyên gia. Bạn có thể hoàn tất để lưu kết quả.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Đề xuất: {recommendation.role}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Chọn một bác sĩ/phù hợp từ danh sách dưới đây (lọc theo vai
                  trò đề xuất).
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredDoctors.map((d) => {
                    const picked = pickedDoctorId === d.id;
                    return (
                      <label
                        key={d.id}
                        className={`border rounded-xl p-4 cursor-pointer transition block
                          ${
                            picked
                              ? "border-teal-600 ring-2 ring-teal-200 bg-teal-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="doctor"
                          className="hidden"
                          checked={picked}
                          onChange={() => setPickedDoctorId(d.id)}
                        />
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {d.fullName}
                            </div>
                            <div className="text-sm text-teal-700">
                              {d.role}
                            </div>
                          </div>
                          {picked && (
                            <span className="text-xs px-2 py-1 rounded-full bg-teal-600 text-white">
                              Đã chọn
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Chuyên môn:</span>{" "}
                          {d.specialization.join(", ")}
                        </div>
                        <div className="text-sm text-gray-500">{d.bio}</div>
                      </label>
                    );
                  })}
                  {filteredDoctors.length === 0 && (
                    <div className="text-sm text-gray-600">
                      Hiện chưa có bác sĩ phù hợp với vai trò này. Vui lòng hoàn
                      tất để chúng tôi liên hệ sau.
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 4 && (
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Xem lại & xác nhận
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-white border">
                <div className="font-medium text-gray-800">PHQ-9</div>
                <div>
                  Điểm: <span className="font-semibold">{phqScore}</span>
                </div>
                <div>
                  Nhóm:{" "}
                  <span className="font-semibold text-teal-700">
                    {phqBand(phqScore).band}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <div className="font-medium text-gray-800">GAD-7</div>
                <div>
                  Điểm: <span className="font-semibold">{gadScore}</span>
                </div>
                <div>
                  Nhóm:{" "}
                  <span className="font-semibold text-teal-700">
                    {gadBand(gadScore).band}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="font-medium text-gray-800">Ưu tiên ghép:</div>
                <div>
                  {dominant} →{" "}
                  {recommendation.role === "None"
                    ? "Không cần bác sĩ"
                    : recommendation.role}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="font-medium text-gray-800">Bác sĩ đã chọn:</div>
                <div>
                  {pickedDoctorId
                    ? (() => {
                        const d = DOCTORS.find((x) => x.id === pickedDoctorId);
                        return d ? `${d.fullName} (${d.role})` : "—";
                      })()
                    : recommendation.role === "None"
                    ? "— (Không cần bác sĩ)"
                    : "— (chưa chọn)"}
                </div>
              </div>

              <div className="md:col-span-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                Lưu ý: Kết quả sàng lọc không phải là chẩn đoán y khoa. Hãy trao
                đổi trực tiếp với chuyên gia.
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Quay lại
          </button>

          {step < 4 ? (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              Tiếp tục →
            </button>
          ) : (
            <button
              onClick={submitAll}
              className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              Gửi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
