import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  LogOut,
  MessageSquareText,
  NotebookPen,
  PhoneCall,
  Search,
  Settings,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";

/**
 * Doctor Portal — single-file demo component for Vite + Tailwind
 * --------------------------------------------------------------
 * This file focuses on the *Doctor* side of a mental‑health web app.
 * It includes: schedule, patient list, assessments (PHQ‑9/GAD‑7),
 * treatment plans, SOAP notes, messaging, notifications, and settings.
 *
 * Notes
 * - Pure client demo (no real backend). Wire API calls where marked.
 * - Accessible, keyboard‑navigable controls and semantic markup.
 * - Mobile‑first responsive layout; sticky header; collapsible sidebar.
 */

// ---------- Mock data (replace with real API calls) ----------
const MOCK_PATIENTS = [
  {
    id: "p001",
    name: "Nguyễn Thu Hà",
    age: 27,
    gender: "F",
    lastSeen: "2025-10-28",
    primaryIssue: "Lo âu",
    phq9: 6,
    gad7: 12,
    risk: "low",
  },
  {
    id: "p002",
    name: "Trần Minh Quân",
    age: 34,
    gender: "M",
    lastSeen: "2025-10-29",
    primaryIssue: "Trầm cảm",
    phq9: 15,
    gad7: 5,
    risk: "high",
  },
  {
    id: "p003",
    name: "Phạm Kim Anh",
    age: 22,
    gender: "F",
    lastSeen: "2025-10-20",
    primaryIssue: "Stress công việc",
    phq9: 9,
    gad7: 8,
    risk: "medium",
  },
];

const MOCK_APPTS = [
  {
    id: "a001",
    patientId: "p001",
    patientName: "Nguyễn Thu Hà",
    at: "2025-11-01T09:00:00",
    type: "Follow‑up",
    location: "Video",
    roomUrl: "#/call/a001",
  },
  {
    id: "a002",
    patientId: "p002",
    patientName: "Trần Minh Quân",
    at: "2025-11-01T10:30:00",
    type: "Đánh giá ban đầu",
    location: "Video",
    roomUrl: "#/call/a002",
  },
  {
    id: "a003",
    patientId: "p003",
    patientName: "Phạm Kim Anh",
    at: "2025-11-01T14:00:00",
    type: "Follow‑up",
    location: "Video",
    roomUrl: "#/call/a003",
  },
];

const MOCK_MESSAGES = {
  p001: [
    { id: 1, who: "patient", text: "Em hơi mất ngủ mấy hôm nay…", at: "08:11" },
    {
      id: 2,
      who: "doctor",
      text: "Mình thử vệ sinh giấc ngủ nhé.",
      at: "08:16",
    },
  ],
  p002: [
    {
      id: 1,
      who: "patient",
      text: "Em thấy mệt mỏi, ít động lực.",
      at: "Hôm qua",
    },
  ],
  p003: [],
};

const MOCK_NOTIFS = [
  {
    id: "n1",
    type: "message",
    text: "Tin nhắn mới từ Thu Hà",
    unread: true,
    at: "08:22",
  },
  {
    id: "n2",
    type: "appt",
    text: "Cuộc hẹn với Minh Quân lúc 10:30",
    unread: true,
    at: "08:00",
  },
  {
    id: "n3",
    type: "system",
    text: "Bản cập nhật bảo mật đã áp dụng",
    unread: false,
    at: "Hôm qua",
  },
];

// Helper formatting
const fTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fDate = (iso) => new Date(iso).toLocaleDateString();

// Risk badge
function RiskTag({ level }) {
  const map = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        map[level] || "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          level === "high"
            ? "bg-rose-500"
            : level === "medium"
            ? "bg-amber-500"
            : "bg-emerald-500"
        }`}
      />
      {level?.toUpperCase()}
    </span>
  );
}

// Sidebar link component
function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-100 ${
        active ? "bg-slate-100 text-slate-900" : "text-slate-600"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </span>
      {badge ? (
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// Topbar user menu
function UserMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:shadow-sm"
      >
        <img
          src="https://i.pravatar.cc/80?img=65"
          alt="Doctor avatar"
          className="size-8 rounded-full object-cover"
        />
        <div className="hidden text-left sm:block">
          <div className="text-sm font-semibold text-slate-800">BS. POMERA</div>
          <div className="text-xs text-slate-500">Tâm lý trị liệu</div>
        </div>
        <ChevronDown className="size-4 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <a
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
            href="#settings"
          >
            <Settings className="size-4" /> Cài đặt tài khoản
          </a>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50">
            <LogOut className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationBell({ items = [], onOpen }) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <button
      onClick={onOpen}
      className="relative rounded-xl border border-slate-200 bg-white p-2 hover:shadow-sm"
    >
      <Bell className="size-5 text-slate-700" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold text-white">
          {unread}
        </span>
      )}
    </button>
  );
}

function SlideOver({ open, onClose, title, children }) {
  return (
    <div
      className={`fixed inset-0 z-30 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------- Sections ----------
function TodaySchedule({ appts, onJoin }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">Lịch hôm nay</h3>
      </div>
      <ul className="space-y-2">
        {appts.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
          >
            <div>
              <div className="text-sm font-medium text-slate-800">
                {a.patientName}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(a.at).toLocaleString()} • {a.type} • {a.location}
              </div>
            </div>
            <button
              onClick={() => onJoin(a)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Video className="size-4" /> Vào phòng
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PatientList({ patients, onOpenChat, onSelectPatient }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.primaryIssue.toLowerCase().includes(q.toLowerCase())
      ),
    [q, patients]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h3 className="text-sm font-semibold text-slate-800">Bệnh nhân</h3>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên/vấn đề…"
            className="w-64 rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-2 py-2">Tên</th>
              <th className="px-2 py-2">Tuổi</th>
              <th className="px-2 py-2">Vấn đề chính</th>
              <th className="px-2 py-2">PHQ‑9</th>
              <th className="px-2 py-2">GAD‑7</th>
              <th className="px-2 py-2">Rủi ro</th>
              <th className="px-2 py-2">Lần cuối</th>
              <th className="px-2 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-2 py-2 font-medium text-slate-800">
                  {p.name}
                </td>
                <td className="px-2 py-2">{p.age}</td>
                <td className="px-2 py-2">{p.primaryIssue}</td>
                <td className="px-2 py-2">{p.phq9}</td>
                <td className="px-2 py-2">{p.gad7}</td>
                <td className="px-2 py-2">
                  <RiskTag level={p.risk} />
                </td>
                <td className="px-2 py-2">{fDate(p.lastSeen)}</td>
                <td className="px-2 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectPatient(p)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100"
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => onOpenChat(p)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <MessageSquareText className="size-3" /> Nhắn
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Assessments({ patient }) {
  if (!patient)
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        Chọn một bệnh nhân để xem điểm PHQ‑9 / GAD‑7 và lịch sử.
      </div>
    );
  const { phq9, gad7 } = patient;
  const dominant = phq9 >= gad7 ? "PHQ‑9" : "GAD‑7";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">
          Đánh giá · {patient.name}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">PHQ‑9</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">
            {phq9}
            <span className="text-base font-medium text-slate-500"> / 27</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">GAD‑7</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">
            {gad7}
            <span className="text-base font-medium text-slate-500"> / 21</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">
          Gợi ý chuyên môn (dựa theo điểm cao hơn): {dominant}
        </p>
        <ul className="ml-4 list-disc space-y-1 pt-2 text-slate-600">
          <li>0–4: Bình thường → Hướng dẫn tự chăm sóc, chưa cần trị liệu.</li>
          <li>5–9: Nhẹ → Counselor / Coach.</li>
          <li>10–14: Trung bình → Therapist / CBT.</li>
          <li>≥15: Nặng → Psychiatrist, cân nhắc thuốc và theo dõi sát.</li>
        </ul>
      </div>
    </div>
  );
}

function TreatmentPlan({ patient }) {
  const [plan, setPlan] = useState(
    "Mục tiêu ngắn hạn:\n- Cải thiện giấc ngủ\n- Tăng hoạt động thể chất\n\nKế hoạch buổi tới:\n- CBT: nhận diện suy nghĩ tự động\n- Bài tập thư giãn 10’/ngày"
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">
          Liệu trình {patient ? `· ${patient.name}` : ""}
        </h3>
      </div>
      <textarea
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        rows={8}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
      />
      <div className="mt-3 flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Check className="size-4" /> Lưu liệu trình
        </button>
        <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
          Xuất PDF
        </button>
      </div>
    </div>
  );
}

function SoapNotes({ patient }) {
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
  const add = () => {
    if (!note.trim()) return;
    setItems((prev) => [
      { id: crypto.randomUUID(), text: note, at: new Date().toISOString() },
      ...prev,
    ]);
    setNote("");
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <NotebookPen className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">
          Ghi chú SOAP {patient ? `· ${patient.name}` : ""}
        </h3>
      </div>
      <textarea
        placeholder="S:… O:… A:… P:…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Lưu ghi chú
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">
              {new Date(i.at).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
              {i.text}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatPanel({ patient, onClose }) {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState(
    patient ? MOCK_MESSAGES[patient.id] ?? [] : []
  );
  const ref = useRef(null);

  useEffect(() => {
    setMsgs(patient ? MOCK_MESSAGES[patient.id] ?? [] : []);
  }, [patient]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        who: "doctor",
        text,
        at: fTime(new Date().toISOString()),
      },
    ]);
    setText("");
  };

  if (!patient) return null;
  return (
    <SlideOver
      open={!!patient}
      onClose={onClose}
      title={`Nhắn với ${patient.name}`}
    >
      <div className="flex h-full flex-col">
        <div
          ref={ref}
          className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3"
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                m.who === "doctor"
                  ? "ml-auto bg-slate-900 text-white"
                  : "bg-white border border-slate-200"
              }`}
            >
              {m.text}
              <div
                className={`mt-1 text-[10px] ${
                  m.who === "doctor" ? "text-slate-200" : "text-slate-400"
                }`}
              >
                {m.at}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn…"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            onClick={send}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Gửi
          </button>
        </div>
      </div>
    </SlideOver>
  );
}

function VideoQuickStart({ next }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <PhoneCall className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">
          Gọi video nhanh
        </h3>
      </div>
      <div className="space-y-3 text-sm text-slate-700">
        <p>
          Chọn lịch trong ngày hoặc tạo phòng gọi ngay. Tích hợp các dịch vụ như
          LiveKit, Twilio, Daily.co hoặc WebRTC tự xây dựng.
        </p>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
            Tạo phòng tức thì
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <CalendarClock className="size-4" /> Xem lịch hôm nay
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [availability, setAvailability] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: false,
    fri: true,
  });
  const [duration, setDuration] = useState(50);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Settings className="size-5" />
        <h3 className="text-sm font-semibold text-slate-800">Cài đặt khám</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-500">
            Lịch làm việc
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            {[
              ["Th 2", "mon"],
              ["Th 3", "tue"],
              ["Th 4", "wed"],
              ["Th 5", "thu"],
              ["Th 6", "fri"],
            ].map(([label, key]) => (
              <label
                key={key}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  availability[key] ? "border-slate-900" : "border-slate-200"
                }`}
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={availability[key]}
                  onChange={(e) =>
                    setAvailability((v) => ({ ...v, [key]: e.target.checked }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-500">
            Thời lượng mặc định
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={20}
              max={90}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <span className="text-sm text-slate-700">{duration} phút</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Check className="size-4" /> Lưu cài đặt
        </button>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
const NAVS = [
  { key: "dashboard", label: "Tổng quan", icon: Stethoscope },
  { key: "patients", label: "Bệnh nhân", icon: Users },
  { key: "schedule", label: "Lịch khám", icon: CalendarClock },
  { key: "messages", label: "Tin nhắn", icon: MessageSquareText },
  { key: "assess", label: "Đánh giá", icon: ClipboardList },
  { key: "plans", label: "Liệu trình", icon: FileText },
  { key: "notes", label: "Ghi chú SOAP", icon: NotebookPen },
  { key: "settings", label: "Cài đặt", icon: Settings },
];

export default function DoctorPage() {
  const [nav, setNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [chatPatient, setChatPatient] = useState(null);

  const unreadMsgCount = useMemo(
    () => notifs.filter((n) => n.unread && n.type === "message").length,
    [notifs]
  );

  const joinCall = (appt) => {
    alert(
      `(Demo) Vào phòng gọi cho ${appt.patientName}.\nURL: ${appt.roomUrl}`
    );
  };

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  // Responsive: collapse sidebar on small screens by default
  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="mr-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm hover:shadow-sm lg:hidden"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                MD
              </div>
              <div>
                <div className="text-sm font-bold leading-tight text-slate-900">
                  Bác sĩ Portal
                </div>
                <div className="text-[11px] leading-tight text-slate-500">
                  Sức khỏe tâm lý · v1
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              items={notifs}
              onOpen={() => setNotifOpen(true)}
            />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
          <nav className="sticky top-[64px] space-y-1">
            {NAVS.map((n) => (
              <NavItem
                key={n.key}
                icon={n.icon}
                label={n.label}
                active={nav === n.key}
                onClick={() => setNav(n.key)}
                badge={
                  n.key === "messages" && unreadMsgCount
                    ? unreadMsgCount
                    : undefined
                }
              />
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {nav === "dashboard" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <VideoQuickStart next={() => setNav("schedule")} />
                <TodaySchedule appts={MOCK_APPTS} onJoin={joinCall} />
              </div>
              <div className="space-y-4">
                <Assessments patient={selectedPatient} />
              </div>
            </div>
          )}

          {nav === "patients" && (
            <PatientList
              patients={MOCK_PATIENTS}
              onOpenChat={(p) => setChatPatient(p)}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setNav("assess");
              }}
            />
          )}

          {nav === "schedule" && (
            <TodaySchedule appts={MOCK_APPTS} onJoin={joinCall} />
          )}
          {nav === "messages" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              Chọn bệnh nhân ở mục <b>Bệnh nhân</b> để mở khung chat. (Demo)
            </div>
          )}
          {nav === "assess" && <Assessments patient={selectedPatient} />}
          {nav === "plans" && <TreatmentPlan patient={selectedPatient} />}
          {nav === "notes" && <SoapNotes patient={selectedPatient} />}
          {nav === "settings" && <SettingsPanel />}
        </section>
      </main>

      {/* Notifications */}
      <SlideOver
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Thông báo"
      >
        <div className="mb-3 flex justify-end">
          <button
            onClick={markAllRead}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
          >
            Đánh dấu đã đọc
          </button>
        </div>
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-3 ${
                n.unread ? "border-slate-900" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800">
                  {n.text}
                </div>
                <div className="text-xs text-slate-500">{n.at}</div>
              </div>
            </li>
          ))}
        </ul>
      </SlideOver>

      {/* Chat drawer */}
      <ChatPanel patient={chatPatient} onClose={() => setChatPatient(null)} />

      <footer className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-400">
        © 2025 – Demo giao diện Bác sĩ. Kết nối API (auth, DB, video, chat,
        notifications) theo backend Node.js của bạn.
      </footer>
    </div>
  );
}

/**
 * Integration notes (backend Node.js outline)
 * ------------------------------------------
 *
 * Suggested REST endpoints (Express):
 *   GET  /api/doctor/me
 *   GET  /api/doctor/:id/schedule?date=YYYY-MM-DD
 *   GET  /api/doctor/:id/patients?q=
 *   GET  /api/patients/:id/assessments  (PHQ‑9/GAD‑7 history)
 *   POST /api/patients/:id/plan
 *   POST /api/patients/:id/notes
 *   GET  /api/doctor/:id/notifications
 *   POST /api/video/rooms (create)
 *   WS  /ws (Socket.IO for chat + live notifications)
 *
 * Replace MOCK_* with fetched data and move state to React Query/Zustand.
 */
