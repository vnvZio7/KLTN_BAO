import React, { useMemo, useState, useRef, useEffect, Activity } from "react";
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
  Dot,
  ActivitySquare,
  UsersRound,
  Lightbulb,
  Heart,
  Puzzle,
  Layers,
  Scale,
  Users,
  Focus,
  Leaf,
} from "lucide-react";

/**
 * UserHomeworkPage — TRANG BÀI TẬP CỦA NGƯỜI DÙNG (2–3 bài đã giao)
 * - KHÔNG đếm ngược, chỉ hiện thời lượng gợi ý & hạn.
 * - Trạng thái rút gọn: CHỈ "Chưa nộp" và "Đã nộp" (theo tồn tại submission).
 * - Phù hợp với frequency: daily/weekly/once (tracker hôm nay/tuần này + 7-day timeline cho daily).
 * - Phần "Đã nộp gần nhất" và phần "Chưa nộp" có chiều cao BẰNG NHAU (placeholder có min-h cố định).
 * - Submission schema: { assignmentId, userId, answers, attachments[], selfRating(1-5), moodBefore(1-10), moodAfter(1-10) }
 */

// ====== DEMO templates (có thể thay bằng templatesMap thật) ======
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
const startOfDay = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diffToMon = (day + 6) % 7; // Monday(1) as start
  d.setDate(d.getDate() - diffToMon);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeek(date) {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return e;
}
function prettyDue(days = 3) {
  const t = new Date();
  t.setDate(t.getDate() + days);
  return t.toISOString();
}
function prettyDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
function daysLeft(iso) {
  const d = new Date(iso).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / msPerDay);
}

// ====== Chip / Pill ======
function Chip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export const methodTheme = {
  CBT: {
    ring: "from-fuchsia-400 to-pink-400",
    text: "text-fuchsia-700",
    Icon: Brain,
  },

  "Behavioral Activation": {
    ring: "from-amber-400 to-orange-400",
    text: "text-amber-700",
    Icon: Activity,
  },

  ACT: {
    ring: "from-green-400 to-emerald-400",
    text: "text-green-700",
    Icon: Leaf,
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
  console.log(method);
  if (!method) return null;
  const theme = methodTheme[method] || methodTheme.Relaxation;
  const Icon = theme.Icon || Target;
  console.log(theme, Icon);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${theme.text} border-slate-200 bg-white`}
    >
      <Icon size={14} /> {method}
    </span>
  );
}

// ====== Chuẩn hoá Assignment -> Item UI ======
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
      submissions: [], // client demo
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

// ====== Confetti đơn giản ======
function Confetti({ show, onDone }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // vw
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
  }, [show]);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p._id}
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

// ====== Frequency-aware indicators ======
function DailyTracker({ submissions = [] }) {
  // 7 ngày qua: hôm nay là index 6
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const hasOnDay = (d) =>
    submissions.some((s) => isSameDay(s.at || s.createdAt || s.time || s, d));
  const todayDone = hasOnDay(new Date());
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
          todayDone
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {todayDone ? "Hôm nay: Đã nộp" : "Hôm nay: Chưa nộp"}
      </span>
      <div className="flex items-center gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              hasOnDay(d) ? "bg-emerald-500" : "bg-slate-300"
            }`}
            title={d.toLocaleDateString("vi-VN")}
          />
        ))}
      </div>
    </div>
  );
}
function WeeklyTracker({ submissions = [] }) {
  const s = startOfWeek(new Date());
  const e = endOfWeek(new Date());
  const count = submissions.filter((x) => {
    const t = new Date(x.at || x.createdAt || x.time || x);
    return t >= s && t < e;
  }).length;
  const done = count > 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
          done
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        Tuần này: {done ? "Đã nộp" : "Chưa nộp"}
      </span>
      <span className="text-slate-600">
        Số lần nộp tuần này: <b>{count}</b>
      </span>
    </div>
  );
}

// ====== Modal làm bài: 3 bước (pre/work/post) KHÔNG timer ======
function AssignmentModal({ open, onClose, item, onSubmit }) {
  const [step, setStep] = useState("pre"); // pre -> work -> post
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(7);
  const [selfRating, setSelfRating] = useState(4);
  const [answersText, setAnswersText] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!open) {
      setStep("pre");
      setMoodBefore(5);
      setMoodAfter(7);
      setSelfRating(4);
      setAnswersText("");
      setFiles([]);
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
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Info header: chỉ hiển thị thời gian & hạn + frequency */}
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
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium ${
                item.frequency === "daily"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : item.frequency === "weekly"
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {item.frequency === "daily"
                ? "Hàng ngày"
                : item.frequency === "weekly"
                ? "Hàng tuần"
                : "Một lần"}
            </span>
          </div>

          {/* Nội dung / các bước */}
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
                  placeholder="Nhập câu trả lời "
                />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  <FileUp size={16} /> Tải tệp minh chứng
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []).map(
                        (f) => ({ name: f.name, size: f.size })
                      );
                      setFiles(list);
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-slate-600 text-sm">
                    {files.map((f, i) => (
                      <li key={i}>{f.name}</li>
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
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("work")}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    // Chuẩn bị Submission theo schema
                    let answers;
                    try {
                      answers = JSON.parse(answersText || '""');
                    } catch {
                      answers = { text: answersText };
                    }
                    const payload = {
                      assignmentId: item._id,
                      userId: "u1", // demo
                      answers,
                      attachments: files.map((f) => f.name),
                      selfRating,
                      moodBefore,
                      moodAfter,
                    };
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

export default function UserHomeworkPage({
  assignments,
  templatesMap = TEMPLATES_MAP,
}) {
  // Demo 3 assignment nếu không truyền props
  console.log(assignments);
  const demoAssignments = [
    {
      _id: "as1",
      userId: "u1",
      doctorId: "d1",
      templateId: "tpl-breath-478",
      difficulty: "easy",
      frequency: "daily",
      dueDate: prettyDue(1),
    },
    {
      _id: "as2",
      userId: "u1",
      doctorId: "d1",
      templateId: "tpl-mindfulness-5m",
      difficulty: "easy",
      frequency: "weekly",
      dueDate: prettyDue(3),
    },
    {
      _id: "as3",
      userId: "u1",
      doctorId: "d1",
      templateId: "tpl-cbt-journal",
      difficulty: "medium",
      frequency: "once",
      dueDate: prettyDue(7),
    },
  ];

  const seed = useMemo(
    () => assignments?.length && normalizeAssignments(assignments),
    [assignments]
  );
  console.log(seed);
  const [items, setItems] = useState(seed || []);
  const [active, setActive] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [freqFilter, setFreqFilter] = useState("all"); // all | once | daily | weekly

  // Tính trạng thái rút gọn: chỉ pending/submitted + đếm theo frequency
  const stats = useMemo(() => {
    const total = items.length;
    const submitted = items.filter(
      (i) => (i.submissions?.length || 0) > 0
    ).length;
    const pending = total - submitted;
    const daily = items.filter((i) => i.frequency === "daily").length;
    const weekly = items.filter((i) => i.frequency === "weekly").length;
    const once = items.filter((i) => i.frequency === "once").length;
    return { total, pending, submitted, daily, weekly, once };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (freqFilter === "all") return items;
    return items.filter((i) => i.frequency === freqFilter);
  }, [items, freqFilter]);

  const handleSubmit = (submission) => {
    setItems((prev) =>
      prev.map((it) =>
        it._id === submission.assignmentId
          ? {
              ...it,
              submissions: [
                {
                  id: Math.random().toString(36).slice(2),
                  at: new Date().toISOString(),
                  ...submission,
                },
                ...(it.submissions || []),
              ],
            }
          : it
      )
    );
    setShowConfetti(true);
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
                  <b>mức độ hiệu quả</b>.
                </li>
                <li>
                  Có thể lọc theo <b>tần suất (frequency)</b> ngay bên dưới.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Frequency filter bar */}
        <div className="relative z-10 border-t border-white/60 bg-white/50 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-700 mr-2">Lọc tần suất:</span>
            {[
              { key: "all", label: `Tất cả (${stats.total})` },
              { key: "daily", label: `Hàng ngày (${stats.daily})` },
              { key: "weekly", label: `Hàng tuần (${stats.weekly})` },
              { key: "once", label: `Một lần (${stats.once})` },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFreqFilter(opt.key)}
                className={`rounded-full border px-3 py-1.5 ${
                  freqFilter === opt.key
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Assigned list (CHỈ hiển thị thời gian, và trạng thái rút gọn) */}
      <section className="grid gap-4 md:grid-cols-2">
        {filteredItems.map((it, idx) => {
          {
            /* console.log(it); */
          }
          const theme = methodTheme[it.method] || methodTheme.Relaxation;
          const isSubmitted = (it.submissions?.length || 0) > 0;
          const left = daysLeft(it.due);
          const dueCls =
            left <= 1
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-slate-700 bg-slate-50 border-slate-200";
          const lastSub = isSubmitted ? it.submissions[0] : null;
          return (
            <motion.article
              key={it.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Colored left bar */}
              <div
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${theme.ring}`}
              />
              <div className="absolute right-3 top-3">
                {isSubmitted ? (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                    <Sparkles size={14} /> Đã nộp
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                    Chưa nộp
                  </span>
                )}
              </div>

              <div className="p-4 flex h-full flex-col">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <MethodPill method={it.method} />
                  {/* Frequency badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      it.frequency === "daily"
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : it.frequency === "weekly"
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {it.frequency === "daily"
                      ? "Hàng ngày"
                      : it.frequency === "weekly"
                      ? "Hàng tuần"
                      : "Một lần"}
                  </span>
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

                {/* CHỈ hiển thị thông tin thời gian */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <IconTimer size={14} /> Thời gian: {it.estimatedMinutes}{" "}
                    phút
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    Hạn: <b>{prettyDate(it.due)}</b>
                  </div>
                </div>

                {/* Frequency-aware tracker + summary: chiều cao BẰNG NHAU */}
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 min-h-[104px]">
                  {/* tracker theo frequency */}
                  {it.frequency === "daily" && (
                    <DailyTracker submissions={it.submissions} />
                  )}
                  {it.frequency === "weekly" && (
                    <WeeklyTracker submissions={it.submissions} />
                  )}
                  {it.frequency === "once" && (
                    <div className="text-xs text-slate-600">
                      Bài một lần — nộp trước hạn để hoàn thành.
                    </div>
                  )}

                  {/* summary/placeholder */}
                  {isSubmitted ? (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-700">
                      <div className="font-medium mb-0.5">Đã nộp gần nhất</div>
                      <div>
                        Hiệu quả: <b>{lastSub.selfRating}/5</b> — Tâm trạng:{" "}
                        <b>{lastSub.moodBefore}</b> → <b>{lastSub.moodAfter}</b>
                      </div>
                      {lastSub.attachments?.length > 0 && (
                        <div className="mt-0.5">
                          Tệp đính kèm: {lastSub.attachments.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-700">
                      <div className="font-medium mb-0.5">Chưa nộp</div>
                      <div>
                        {it.frequency === "daily"
                          ? "Thử hoàn thành 1 lần hôm nay để giữ streak bạn nhé!"
                          : it.frequency === "weekly"
                          ? "Hãy nộp ít nhất 1 lần trong tuần này."
                          : "Bạn chỉ cần nộp 1 lần trước hạn."}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA dán chân card để các card đều chiều cao */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setActive(it)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Mở chi tiết
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(it)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white shadow ${
                      isSubmitted
                        ? "bg-slate-500 hover:bg-slate-600"
                        : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:brightness-110"
                    }`}
                  >
                    <Play size={16} /> {isSubmitted ? "Nộp lại" : "Bắt đầu"}
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
        onSubmit={(submission) => {
          handleSubmit(submission);
        }}
      />
    </div>
  );
}
