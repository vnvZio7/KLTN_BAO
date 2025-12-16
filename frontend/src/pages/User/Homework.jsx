// src/pages/UserHomeworkPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  FileUp,
  Info,
  Brain,
  Music2,
  Wind,
  Target,
  CalendarDays,
  Sparkles,
  Star,
  PartyPopper,
  Timer as IconTimer,
  ActivitySquare,
  UsersRound,
  Lightbulb,
  Heart,
  Puzzle,
  Layers,
  Scale,
  Users,
  Focus,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

// ====== DEMO templates (nếu cần) ======
const EXERCISES = [
  {
    _id: "tpl-breath-478",
    title: "Thở sâu 4-7-8",
    method: "Relaxation",
    estimatedMinutes: 5,
    content:
      "Ngồi thẳng, hít sâu trong 4 giây, giữ hơi 7 giây, thở ra chậm trong 8 giây. Lặp lại 4–8 lần, 2–3 lần/ngày.",
    attachments: [],
  },
  {
    _id: "tpl-mindfulness-5m",
    title: "Thiền chánh niệm 5 phút",
    method: "Mindfulness",
    estimatedMinutes: 5,
    content:
      "Ngồi yên, nhắm mắt, tập trung vào hơi thở ra vào. Khi tâm trí trôi đi, nhẹ nhàng đưa sự chú ý về hơi thở. Thực hiện 1–2 lần/ngày.",
    attachments: [],
  },
  {
    _id: "tpl-cbt-journal",
    title: "Ghi nhật ký suy nghĩ",
    method: "CBT",
    estimatedMinutes: 20,
    content:
      "Ghi lại: 1) Tình huống, 2) Suy nghĩ, 3) Cảm xúc, 4) Bằng chứng ủng hộ/phản bác, 5) Suy nghĩ thay thế.",
    attachments: [],
  },
];
const TEMPLATES_MAP = Object.fromEntries(EXERCISES.map((t) => [t._id, t]));

// ====== helpers thời gian ======
const msPerDay = 24 * 60 * 60 * 1000;
function daysLeft(iso) {
  if (!iso) return 0;
  const d = new Date(iso).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / msPerDay);
}
function prettyDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

// ====== Chip / Pill ======
export const methodTheme = {
  CBT: {
    ring: "from-fuchsia-400 to-pink-400",
    text: "text-fuchsia-700",
    Icon: Brain,
  },
  "Behavioral Activation": {
    ring: "from-amber-400 to-orange-400",
    text: "text-amber-700",
    Icon: ActivitySquare,
  },
  ACT: {
    ring: "from-green-400 to-emerald-400",
    text: "text-green-700",
    Icon: Wind,
  },
  MBCT: {
    ring: "from-indigo-400 to-blue-400",
    text: "text-indigo-700",
    Icon: Focus,
  },
  Mindfulness: {
    ring: "from-teal-400 to-emerald-400",
    text: "text-teal-700",
    Icon: Wind,
  },
  Exposure: {
    ring: "from-orange-400 to-rose-400",
    text: "text-orange-700",
    Icon: Target,
  },
  "Interpersonal (IPT)": {
    ring: "from-rose-400 to-pink-400",
    text: "text-rose-700",
    Icon: Users,
  },
  DBT: {
    ring: "from-violet-400 to-purple-400",
    text: "text-violet-700",
    Icon: Scale,
  },
  Schema: {
    ring: "from-yellow-400 to-amber-400",
    text: "text-yellow-700",
    Icon: Layers,
  },
  Psychodynamic: {
    ring: "from-slate-500 to-blue-500",
    text: "text-slate-700",
    Icon: Puzzle,
  },
  "Emotion-Focused (EFT)": {
    ring: "from-rose-400 to-red-400",
    text: "text-rose-700",
    Icon: Heart,
  },
  "Solution-Focused (SFBT)": {
    ring: "from-cyan-400 to-sky-400",
    text: "text-cyan-700",
    Icon: Lightbulb,
  },
  Family: {
    ring: "from-teal-400 to-sky-400",
    text: "text-teal-700",
    Icon: UsersRound,
  },
  "Biofeedback / Neurofeedback": {
    ring: "from-lime-400 to-green-400",
    text: "text-lime-700",
    Icon: ActivitySquare,
  },
  Relaxation: {
    ring: "from-indigo-400 to-cyan-400",
    text: "text-indigo-700",
    Icon: Music2,
  },
};

function MethodPill({ method }) {
  if (!method) return null;
  const theme = methodTheme[method] || methodTheme.Relaxation;
  const Icon = theme.Icon || Target;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${theme.text} border-slate-200 bg-white`}
    >
      <Icon size={14} /> {method}
    </span>
  );
}

// ====== Chuẩn hoá Assignment -> Item UI (thêm aiSuggested) ======
function normalizeAssignments(assignments) {
  return assignments.map((base) => {
    return {
      id: base._id,
      title: base.title,
      content: base.content,
      method: base.method,
      estimatedMinutes: base.estimatedMinutes || 10,
      attachments: base.attachments || [],
      difficulty: base.difficulty,
      frequency: base.frequency,
      due: base.dueDate && new Date(base.dueDate).toISOString(),
      doctorId: base.doctorId,
      aiSuggested: base.aiSuggested === true, // 👈 flag gợi ý bởi AI
    };
  });
}

// ====== Rating sao ======
function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange?.(n)}
          className={`p-1 rounded ${
            n <= value ? "text-amber-500" : "text-slate-300"
          }`}
          aria-label={`${n} sao`}
        >
          <Star size={18} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

// ====== Confetti ======
function Confetti({ show, onDone }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        r: Math.random() * 360,
        d: 0.8 + Math.random() * 0.8,
        delay: Math.random() * 0.2,
      })),
    []
  );
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), 1200);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: -20, x: `${p.x}vw`, rotate: 0 }}
          animate={{ opacity: 1, y: 320, rotate: p.r }}
          transition={{ duration: p.d, delay: p.delay, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-sm"
          style={{ background: `linear-gradient(90deg,#6366f1,#22d3ee)` }}
        />
      ))}
    </div>
  );
}

// ====== Modal làm bài (thêm feedbackDoctor) ======
function AssignmentModal({ open, onClose, item, onSubmit }) {
  const [step, setStep] = useState("pre"); // pre -> work -> post
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(7);
  const [selfRating, setSelfRating] = useState(4);
  const [answersText, setAnswersText] = useState("");
  const [files, setFiles] = useState([]);
  const [feedbackDoctor, setFeedbackDoctor] = useState(""); // 👈 feedback gửi bác sĩ

  useEffect(() => {
    if (!open) {
      setStep("pre");
      setMoodBefore(5);
      setMoodAfter(7);
      setSelfRating(4);
      setAnswersText("");
      setFiles([]);
      setFeedbackDoctor("");
    }
  }, [open]);

  if (!open || !item) return null;
  const left = daysLeft(item.due);
  const dueCls =
    left <= 1
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              {item.aiSuggested && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 border-sky-200">
                  <Sparkles size={14} /> Gợi ý bởi AI
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Info header: thời gian & hạn */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-slate-700 border-slate-200 bg-slate-50">
              <IconTimer size={14} /> Thời gian: {item.estimatedMinutes} phút
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium ${dueCls}`}
            >
              <CalendarDays size={14} />{" "}
              {left === 0
                ? "Hạn hôm nay"
                : left < 0
                ? `Quá hạn ${Math.abs(left)} ngày`
                : `Còn ${left} ngày`}
            </span>
          </div>

          {/* Pre-step */}
          {step === "pre" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-700">
                <b>Trước khi bắt đầu</b>, bạn đánh giá tâm trạng của mình hôm
                nay thế nào (1–10)?
              </p>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm text-slate-700">
                  Tâm trạng hiện tại: <b>{moodBefore}/10</b>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => setStep("work")}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white shadow hover:bg-indigo-700"
                >
                  <Play size={16} /> Bắt đầu
                </button>
              </div>
            </div>
          )}

          {/* Work-step */}
          {step === "work" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-700">{item.content}</p>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-700">
                  Bài làm
                </div>
                <textarea
                  value={answersText}
                  onChange={(e) => setAnswersText(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Nhập câu trả lời"
                />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  <FileUp size={16} /> Tải tệp minh chứng
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []);
                      setFiles(list);
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-slate-600 text-sm">
                    {files.map((f, i) => (
                      <li key={i}>
                        {f.name} ({Math.round(f.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("pre")}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep("post")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Post-step (moodAfter + rating + feedbackDoctor) */}
          {step === "post" && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Sau khi hoàn thành bài tập
                </div>
                <div className="text-sm text-slate-700">
                  Bạn cảm thấy thế nào bây giờ (1–10)? <b>{moodAfter}/10</b>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-700">
                  Bạn đánh giá hiệu quả bài tập (1–5 sao)
                </div>
                <StarRating value={selfRating} onChange={setSelfRating} />
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-700">
                  Bạn muốn gửi lời nhắn/feedback gì cho bác sĩ?
                </div>
                <textarea
                  value={feedbackDoctor}
                  onChange={(e) => setFeedbackDoctor(e.target.value)}
                  className="w-full min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Ví dụ: Bài tập này giúp em bình tĩnh hơn vào buổi tối, nhưng đoạn X em thấy hơi khó..."
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("work")}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    const payload = {
                      assignmentId: item.id || item._id,
                      answers: answersText || "",
                      moodBefore,
                      moodAfter,
                      feedbackDoctor,
                      attachments: files,
                    };
                    console.log(payload);
                    onSubmit?.(payload);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                >
                  <PartyPopper size={16} /> Nộp bài
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ====== Page chính ======
export default function UserHomeworkPage({
  assignments,
  submissions,
  setHomeworkSubmissions,
}) {
  const seed = useMemo(
    () => (assignments?.length ? normalizeAssignments(assignments) : []),
    [assignments]
  );

  const [items, setItems] = useState(seed || []);
  const [active, setActive] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [openSubmissionId, setOpenSubmissionId] = useState(null);

  // sync lại nếu assignments đổi
  useEffect(() => {
    setItems(seed || []);
  }, [seed]);

  // thống kê
  const stats = useMemo(() => {
    const total = items.length;
    const submitted = submissions.length;
    const pending = total - submitted;
    return { total, pending, submitted };
  }, [items, submissions]);

  // sắp xếp: chưa nộp -> đã nộp -> quá hạn
  const sortedItems = useMemo(() => {
    const getSortKey = (it) => {
      const left = daysLeft(it.due);
      const isOverdue = left < 0;
      const hasSubmission = submissions?.some(
        (s) => s.assignmentId === it.id || s.assignmentId === it._id
      );

      if (!hasSubmission && !isOverdue) return 1; // chưa nộp, còn hạn
      if (hasSubmission) return 2; // đã nộp
      return 3; // quá hạn
    };

    return [...items].sort((a, b) => {
      const sa = getSortKey(a);
      const sb = getSortKey(b);
      if (sa !== sb) return sa - sb;

      const la = daysLeft(a.due);
      const lb = daysLeft(b.due);
      return la - lb;
    });
  }, [items, submissions]);

  // submit bài (gửi feedbackDoctor luôn)
  const handleSubmit = async ({
    assignmentId,
    answers,
    moodBefore,
    moodAfter,
    attachments,
    feedbackDoctor,
  }) => {
    try {
      const payload = {
        assignmentId,
        answers,
        moodBefore,
        moodAfter,
        feedbackDoctor,
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      (attachments || []).forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axiosInstance.post(
        API_PATHS.HOMEWORK_SUBMISSIONS.CREATE_HOMEWORK_SUBMISSION,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newSubmission =
        res.data?.homeworkSubmission ||
        res.data?.data?.homeworkSubmission ||
        res.homeworkSubmission;

      setHomeworkSubmissions((prev) => [newSubmission, ...(prev || [])]);
      setShowConfetti(true);
      toast.success("Nộp bài tập thành công");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Lỗi khi nộp bài tập");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-pink-200 via-indigo-200 to-cyan-200">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-white/40 blur-3xl" />

        <div className="relative z-10 grid gap-6 p-6 md:grid-cols-3 md:p-8">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-semibold md:text-3xl text-slate-800">
              Bài tập của bạn
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700">
              Nhấn "<b>Bắt đầu</b>" để trả lời và nộp bài.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur">
                <div className="text-xs text-slate-600">Tổng</div>
                <div className="text-lg font-semibold text-slate-800">
                  {stats.total}
                </div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur">
                <div className="text-xs text-slate-600">Chưa nộp</div>
                <div className="text-lg font-semibold text-slate-800">
                  {stats.pending}
                </div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur">
                <div className="text-xs text-slate-600">Đã nộp</div>
                <div className="text-lg font-semibold text-slate-800">
                  {stats.submitted}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-slate-700 text-xs backdrop-blur">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <Info size={14} /> Lưu ý
              </div>
              <ul className="mt-1 list-disc pl-4">
                <li>Thời lượng là gợi ý để bạn chủ động sắp xếp.</li>
                <li>
                  Nhớ đánh giá <b>tâm trạng trước–sau</b> và{" "}
                  <b>mức độ hiệu quả</b>, cũng như gửi{" "}
                  <b>feedback cho bác sĩ</b> nếu cần.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách bài tập */}
      <section className="grid gap-4 md:grid-cols-2">
        {sortedItems.map((it, idx) => {
          const theme = methodTheme[it.method] || methodTheme.Relaxation;
          const id = it.id || it._id;
          const left = daysLeft(it.due);
          const isOverdue = left < 0;
          const isSubmitted = submissions?.some((e) => e.assignmentId === id);
          const dueCls =
            left <= 1
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-slate-700 bg-slate-50 border-slate-200";
          const lastSub = isSubmitted
            ? submissions?.find((e) => e.assignmentId === id)
            : null;
          const canStart = !isSubmitted && !isOverdue;
          const showDetail = isSubmitted && openSubmissionId === id;

          const answerText = lastSub
            ? typeof lastSub.answers === "string"
              ? lastSub.answers
              : lastSub.answers?.text || ""
            : "";

          return (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${theme.ring}`}
              />
              <div className="absolute right-3 top-3 space-x-2">
                {it.aiSuggested && (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
                    <Sparkles size={14} /> Gợi ý bởi AI
                  </span>
                )}
                {isSubmitted ? (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                    <Sparkles size={14} /> Đã nộp
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                    Chưa nộp
                  </span>
                )}
              </div>

              <div className="p-4 flex h-full flex-col">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <MethodPill method={it.method} />
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${dueCls}`}
                  >
                    <CalendarDays size={14} />{" "}
                    {left === 0
                      ? "Hạn hôm nay"
                      : left < 0
                      ? `Quá hạn ${Math.abs(left)} ngày`
                      : `Còn ${left} ngày`}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  {it.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {it.content}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <IconTimer size={14} /> Thời gian: {it.estimatedMinutes}{" "}
                    phút
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    Hạn: <b>{prettyDate(it.due)}</b>
                  </div>
                </div>

                {/* Summary / trạng thái */}
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 min-h-[104px]">
                  {isSubmitted && lastSub ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-700">
                      <div className="font-medium mb-0.5">Đã nộp gần nhất</div>
                      <div>
                        Tâm trạng: <b>{lastSub.moodBefore}</b> →{" "}
                        <b>{lastSub.moodAfter}</b>
                      </div>
                      {lastSub.attachments?.length > 0 && (
                        <div className="mt-0.5">
                          Tệp đính kèm: {lastSub.attachments.length}
                        </div>
                      )}

                      {showDetail && (
                        <div className="mt-2 rounded-md bg-white/70 p-2 text-[11px] text-slate-700">
                          <div className="font-semibold mb-1">
                            Chi tiết bài đã nộp
                          </div>
                          {lastSub.at && (
                            <div className="mb-1">
                              Thời gian nộp:{" "}
                              <b>
                                {new Date(lastSub.at).toLocaleString("vi-VN")}
                              </b>
                            </div>
                          )}
                          {answerText && (
                            <div className="mt-1">
                              <div className="font-medium mb-0.5">Bài làm</div>
                              <p className="whitespace-pre-line">
                                {answerText}
                              </p>
                            </div>
                          )}
                          {lastSub.feedbackDoctor && (
                            <div className="mt-2">
                              <div className="font-medium mb-0.5">
                                Feedback gửi bác sĩ
                              </div>
                              <p className="whitespace-pre-line">
                                {lastSub.feedbackDoctor}
                              </p>
                            </div>
                          )}
                          {lastSub.attachments?.length > 0 && (
                            <div className="mt-1">
                              <div className="font-medium mb-0.5">
                                Tệp đính kèm:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {lastSub.attachments?.map((e, i) => (
                                  <span key={i}>
                                    {e?.split("/").at(-1) || e}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-700">
                      <div className="font-medium mb-0.5">Chưa nộp</div>
                      <div>
                        Hãy cố gắng hoàn thành bài tập này trước hạn để theo dõi
                        tiến trình của bạn cùng bác sĩ nhé.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {isSubmitted && (
                    <button
                      onClick={() =>
                        setOpenSubmissionId((prev) => (prev === id ? null : id))
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      {showDetail ? "Ẩn chi tiết" : "Mở chi tiết"}
                    </button>
                  )}

                  <motion.button
                    whileHover={canStart ? { scale: 1.02 } : {}}
                    whileTap={canStart ? { scale: 0.98 } : {}}
                    onClick={canStart ? () => setActive(it) : undefined}
                    disabled={!canStart}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white shadow
                      ${
                        isSubmitted
                          ? "bg-slate-500"
                          : "bg-gradient-to-r from-indigo-600 to-cyan-600"
                      }
                      ${
                        !canStart
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:brightness-110"
                      }`}
                  >
                    <Play size={16} />
                    {!canStart && !isSubmitted
                      ? "Quá hạn"
                      : isSubmitted
                      ? "Đã nộp"
                      : "Bắt đầu"}
                  </motion.button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      <AssignmentModal
        open={!!active}
        onClose={() => setActive(null)}
        item={active}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
