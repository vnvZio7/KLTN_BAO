// src/components/CombinedQuiz.jsx
import React from "react";
import { ChevronLeft } from "lucide-react";

const Card = ({ children }) => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
    {children}
  </div>
);

/**
 * props:
 * - joined: [{ code, qIndex, q, title, desc }]
 * - cur: number (index câu hiện tại – do parent giữ)
 * - setCur: (fn) => void
 * - answers: { [code]: number[] }
 * - onAnswersChange: (nextAnswers) => void
 * - mode: "auto" | "manual"
 *      - auto: chọn xong câu cuối => gọi onFinish(nextAnswers)
 *      - manual: chỉ đổi câu, không auto; parent tự có nút Submit
 * - onFinish: (finalAnswers) => void  // gọi khi hoàn tất (mode auto)
 */
export default function CombinedQuiz({
  joined,
  cur,
  setCur,
  answers,
  onAnswersChange,
  mode = "auto",
  onFinish,
}) {
  const totalAll = joined.length;
  const curEntry = joined[cur] || null;

  if (!curEntry) return null;

  const { code, qIndex, q, title, desc } = curEntry;

  const pick = (optIdx) => {
    // cập nhật answers
    const prev = answers[code] || [];
    const nextCodeAnswers = [...prev];
    nextCodeAnswers[qIndex] = optIdx;

    const nextAnswers = {
      ...answers,
      [code]: nextCodeAnswers,
    };

    onAnswersChange(nextAnswers);

    const isLast = cur >= totalAll - 1;

    if (!isLast) {
      // chỉ sang câu tiếp theo
      setCur((c) => c + 1);
    } else if (mode === "auto" && onFinish) {
      // hết câu cuối, chỉ auto submit nếu mode = auto
      onFinish(nextAnswers);
    }
  };

  const goPrev = () => setCur((c) => Math.max(0, c - 1));

  return (
    <Card>
      <div className="relative">
        {/* Nút quay lại ẩn khi là câu đầu tiên */}
        {cur > 0 && (
          <button
            onClick={goPrev}
            className="absolute inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại câu trước
          </button>
        )}
        {/* Tiêu đề test theo câu hiện tại */}
        <h2 className="text-2xl font-semibold text-teal-700 mb-2 text-center">
          {title || code}
        </h2>
        {desc ? (
          <p className="text-sm text-gray-600 mb-4 text-center">{desc}</p>
        ) : null}
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <p className="font-medium text-gray-800 mb-3 text-center">
          {cur + 1}. {q?.question}
        </p>

        <div
          className={`${
            code === "THERAPY_MATCH" ? "grid grid-cols-2 gap-2" : "space-y-2"
          }`}
        >
          {(q?.options || []).map((label, optIdx) => (
            <button
              key={optIdx}
              type="button"
              onClick={() => pick(optIdx)}
              className="w-full h-full px-3 py-2 rounded-lg border border-gray-200 
                 hover:bg-gray-50 text-sm flex items-center justify-center text-center"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tiến độ (tùy thích) */}
      <div className="mt-3 text-center text-xs text-gray-500">
        Câu {cur + 1}/{totalAll}
      </div>
    </Card>
  );
}
