import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  NotebookPen,
  PhoneCall,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Users,
  Video,
  X,
  CalendarPlus,
  Eye,
  PencilLine,
  CheckCircle2,
  Pencil,
} from "lucide-react";

/**
 * Doctor Portal — single file demo for React + Vite + Tailwind
 * ------------------------------------------------------------------
 * Focus: Manage many patients — stats, chat, calls, requests, calendar,
 * homework assignments, notifications.
 *
 * Notes
 * - Pure client demo (no backend). Replace MOCK_* with real API.
 * - Accessible markup, keyboard friendly, responsive, mobile-first.
 * - All UI components and helpers live in this one file for convenience.
 */

// ------------------------------ Helpers ------------------------------
const fmtDate = (d) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(d));
const fmtTime = (d) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
const fmtDateTime = (d) => `${fmtDate(d)} • ${fmtTime(d)}`;
const uid = () => Math.random().toString(36).slice(2, 9);
const todayISO = () => new Date().toISOString();
const withinSameDay = (a, b = new Date()) => {
  const da = new Date(a),
    db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// PHQ-9 classification (0–27)
function classifyPHQ9(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  if (score <= 19) return { label: "Nặng vừa", tone: "alert" };
  return { label: "Rất nặng", tone: "danger" };
}
// GAD-7 classification (0–21)
function classifyGAD7(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  return { label: "Nặng", tone: "danger" };
}

function toneToClass(tone) {
  switch (tone) {
    case "ok":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "mild":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "warn":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "alert":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "danger":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

// --------------------------- Mocked Data -----------------------------
const MOCK_PATIENTS = [
  {
    id: "p001",
    name: "Trần Minh Anh",
    gender: "Nữ",
    age: 27,
    tags: ["Trầm cảm", "Lo âu"],
    latestTests: { PHQ9: 14, GAD7: 8 },
    nextCall: new Date(Date.now() + 36e5).toISOString(), // +1h
    unread: 2,
    assignments: [
      {
        id: uid(),
        code: "CBT_TR",
        title: "CBT Thought Record",
        due: addDaysISO(2),
        status: "nộp bài",
      },
      {
        id: uid(),
        code: "MF_BREATH",
        title: "Mindfulness Breathing",
        due: addDaysISO(5),
        status: "đang làm",
      },
    ],
    notes: "Ưu tiên can thiệp CBT + Mindfulness, theo dõi giấc ngủ.",
    messages: [
      {
        id: uid(),
        sender: "patient",
        text: "Em cảm thấy đỡ hơn một chút.",
        at: addMinsISO(-120),
      },
      {
        id: uid(),
        sender: "doctor",
        text: "Tốt lắm, tiếp tục bài thở 5-7-8 nhé!",
        at: addMinsISO(-110),
      },
    ],
  },
  {
    id: "p002",
    name: "Ngô Quốc Huy",
    gender: "Nam",
    age: 31,
    tags: ["Mất ngủ"],
    latestTests: { PHQ9: 6, GAD7: 5 },
    nextCall: addDaysISO(1, 10),
    unread: 0,
    assignments: [
      {
        id: uid(),
        code: "SLEEP_HYGIENE",
        title: "Sleep Hygiene Checklist",
        due: addDaysISO(1),
        status: "chưa làm",
      },
    ],
    notes: "Đề xuất sleep hygiene + hạn chế caffeine.",
    messages: [],
  },
  {
    id: "p003",
    name: "Bùi Gia Hân",
    gender: "Nữ",
    age: 24,
    tags: ["Ám ảnh cưỡng chế"],
    latestTests: { PHQ9: 9, GAD7: 12 },
    nextCall: addDaysISO(3, 16),
    unread: 1,
    assignments: [],
    notes: "Theo dõi exposure hierarchy tuần này.",
    messages: [
      {
        id: uid(),
        sender: "patient",
        text: "Khi tiếp xúc em hơi lo lắng.",
        at: addMinsISO(-60),
      },
    ],
  },
  {
    id: "p004",
    name: "Phạm Nhật Quân",
    gender: "Nam",
    age: 29,
    tags: ["Stress công việc"],
    latestTests: { PHQ9: 4, GAD7: 3 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "Coaching kỹ năng quản lý thời gian.",
    messages: [],
  },
  {
    id: "p005",
    name: "Đỗ Thu Hà",
    gender: "Nữ",
    age: 33,
    tags: ["Rối loạn hoảng sợ"],
    latestTests: { PHQ9: 8, GAD7: 15 },
    nextCall: addDaysISO(2, 9),
    unread: 3,
    assignments: [
      {
        id: uid(),
        code: "EXPOSURE_LITE",
        title: "Mini Exposure Steps",
        due: addDaysISO(4),
        status: "đang làm",
      },
    ],
    notes: "Ưu tiên psychoeducation + breathing.",
    messages: [],
  },
  {
    id: "p006",
    name: "Vũ Hải Long",
    gender: "Nam",
    age: 26,
    tags: ["Lo âu"],
    latestTests: { PHQ9: 10, GAD7: 11 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "—",
    messages: [],
  },
  {
    id: "p007",
    name: "Lê Quỳnh Nhi",
    gender: "Nữ",
    age: 22,
    tags: ["Tự ti"],
    latestTests: { PHQ9: 5, GAD7: 7 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "—",
    messages: [],
  },
  {
    id: "p008",
    name: "Phan Tấn Tài",
    gender: "Nam",
    age: 35,
    tags: ["Trầm cảm"],
    latestTests: { PHQ9: 18, GAD7: 9 },
    nextCall: addDaysISO(1, 14),
    unread: 0,
    assignments: [],
    notes: "Theo sát an toàn.",
    messages: [],
  },
];

const MOCK_CALL_REQUESTS = [
  {
    id: uid(),
    patientId: "p003",
    preferred: addDaysISO(1, 15),
    note: "Follow-up sau bài tập",
    status: "pending",
  },
  {
    id: uid(),
    patientId: "p001",
    preferred: addDaysISO(2, 9),
    note: "Kiểm tra tiến triển",
    status: "pending",
  },
];

const MOCK_AVAILABILITY = [
  addDaysISO(1, 10),
  addDaysISO(2, 11),
  addDaysISO(3, 9),
];

const HOMEWORK_TEMPLATES = [
  {
    code: "CBT_TR",
    name: "CBT Thought Record",
    difficulty: "Easy",
    duration: "15–20m",
    target: ["Trầm cảm", "Lo âu"],
  },
  {
    code: "MF_BREATH",
    name: "Mindfulness 5–7–8",
    difficulty: "Easy",
    duration: "10m",
    target: ["Lo âu", "Mất ngủ"],
  },
  {
    code: "EXPOSURE_LITE",
    name: "Exposure Mini Hierarchy",
    difficulty: "Medium",
    duration: "20–30m",
    target: ["Ám ảnh cưỡng chế", "Sợ hãi"],
  },
  {
    code: "SLEEP_HYGIENE",
    name: "Sleep Hygiene Checklist",
    difficulty: "Easy",
    duration: "10–15m",
    target: ["Mất ngủ"],
  },
];

function addDaysISO(days = 0, atHour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(atHour, 0, 0, 0);
  return d.toISOString();
}
function addMinsISO(mins = 0) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

// -------------------------- Reusable UI ------------------------------
const IconBtn = ({ icon: Icon, className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 active:bg-zinc-100 ${className}`}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4" />} {children}
  </button>
);

const Badge = ({ tone = "default", children }) => {
  const map = {
    default: "bg-zinc-100 text-zinc-700 border-zinc-200",
    info: "bg-sky-100 text-sky-700 border-sky-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warn: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
};

const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="rounded-full p-1.5 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-auto p-5">{children}</div>
        {footer && <div className="border-t px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};

const Empty = ({ icon: Icon, title, hint }) => (
  <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center text-zinc-600">
    <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-zinc-100">
      {Icon && <Icon className="h-6 w-6" />}
    </div>
    <div className="text-sm font-medium">{title}</div>
    {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
  </div>
);

const Progress = ({ value = 0, max = 100, label }) => (
  <div>
    <div className="mb-1 flex items-end justify-between text-xs text-zinc-600">
      <span>{label}</span>
      <span>
        {value}/{max}
      </span>
    </div>
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        className="h-full rounded-full bg-zinc-900"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

// --------------------------- Main Component --------------------------
export default function DoctorPage() {
  const [mode, setMode] = useState("template"); // "template" | "custom"
  const [templateSearch, setTemplateSearch] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState("Dễ"); // Dễ | Trung bình | Khó
  const [customDuration, setCustomDuration] = useState("10–15 phút");
  const [customTargets, setCustomTargets] = useState(""); // nhập tag, cách nhau dấu phẩy

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nav, setNav] = useState("dashboard");
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [activePatientId, setActivePatientId] = useState(patients[0]?.id);
  const activePatient = useMemo(
    () => patients.find((p) => p.id === activePatientId),
    [patients, activePatientId]
  );

  const [callRequests, setCallRequests] = useState(MOCK_CALL_REQUESTS);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);
  const [calls, setCalls] = useState(() =>
    patients
      .filter((p) => p.nextCall)
      .map((p) => ({
        id: uid(),
        patientId: p.id,
        time: p.nextCall,
        duration: 45,
        status: "scheduled",
      }))
  );

  const [notifications, setNotifications] = useState([
    {
      id: uid(),
      type: "info",
      text: "3 yêu cầu lịch gọi đang chờ bạn duyệt",
      at: addMinsISO(-15),
      read: false,
    },
  ]);

  // UI modals
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    patientId: null,
    time: addDaysISO(0, new Date().getHours() + 2),
  });

  const [templatePick, setTemplatePick] = useState(HOMEWORK_TEMPLATES[0].code);
  const [templateDue, setTemplateDue] = useState(addDaysISO(3));

  // Derived stats
  const stats = useMemo(() => {
    const total = patients.length;
    const activeChats = patients.filter((p) => (p.unread || 0) > 0).length;
    const upcomingToday = calls.filter((c) => withinSameDay(c.time)).length;
    const pendingReq = callRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const homeworkDueToday = patients.reduce(
      (acc, p) =>
        acc +
        p.assignments.filter(
          (a) => withinSameDay(a.due) && a.status !== "đã duyệt"
        ).length,
      0
    );
    return { total, activeChats, upcomingToday, pendingReq, homeworkDueToday };
  }, [patients, calls, callRequests]);

  // ---------------------- Actions (mocked) ----------------------
  const notify = (text, type = "info") =>
    setNotifications((n) => [
      { id: uid(), type, text, at: todayISO(), read: false },
      ...n,
    ]);

  const acceptRequest = (reqId) => {
    setCallRequests((arr) => arr.filter((r) => r.id !== reqId));
    const req = callRequests.find((r) => r.id === reqId);
    if (!req) return;
    setCalls((c) => [
      {
        id: uid(),
        patientId: req.patientId,
        time: req.preferred,
        duration: 45,
        status: "scheduled",
      },
      ...c,
    ]);
    notify(
      `Đã chấp nhận lịch gọi với ${nameOf(req.patientId)} lúc ${fmtDateTime(
        req.preferred
      )}`,
      "success"
    );
  };

  const declineRequest = (reqId) => {
    setCallRequests((arr) =>
      arr.map((r) => (r.id === reqId ? { ...r, status: "declined" } : r))
    );
    notify("Đã từ chối một yêu cầu lịch gọi", "warn");
  };

  const scheduleCall = ({ patientId, time }) => {
    if (!patientId || !time) return;
    setCalls((c) => [
      { id: uid(), patientId, time, duration: 45, status: "scheduled" },
      ...c,
    ]);
    setPatients((ps) =>
      ps.map((p) => (p.id === patientId ? { ...p, nextCall: time } : p))
    );
    notify(
      `Đã tạo lịch gọi ${fmtDateTime(time)} với ${nameOf(patientId)}`,
      "success"
    );
  };

  const addAvail = (timeISO) => {
    setAvailability((a) => [...a, timeISO].sort());
    notify(`Đã thêm khung giờ khả dụng ${fmtDateTime(timeISO)}`, "info");
  };

  const assignHomework = ({ patientId, templateCode, due }) => {
    const tpl = HOMEWORK_TEMPLATES.find((t) => t.code === templateCode);
    if (!tpl) return;
    setPatients((ps) =>
      ps.map((p) =>
        p.id === patientId
          ? {
              ...p,
              assignments: [
                {
                  id: uid(),
                  code: tpl.code,
                  title: tpl.name,
                  due,
                  status: "chưa làm",
                },
                ...p.assignments,
              ],
            }
          : p
      )
    );
    notify(
      `Đã giao bài tập “${tpl.name}” cho ${nameOf(patientId)} (hạn ${fmtDate(
        due
      )})`,
      "success"
    );
  };

  const markAssignment = ({ patientId, assignmentId, status }) => {
    setPatients((ps) =>
      ps.map((p) =>
        p.id === patientId
          ? {
              ...p,
              assignments: p.assignments.map((a) =>
                a.id === assignmentId ? { ...a, status } : a
              ),
            }
          : p
      )
    );
  };

  const sendMsg = ({ patientId, text }) => {
    if (!text.trim()) return;
    const msg = { id: uid(), sender: "doctor", text, at: todayISO() };
    setPatients((ps) =>
      ps.map((p) =>
        p.id === patientId
          ? { ...p, messages: [...(p.messages || []), msg], unread: 0 }
          : p
      )
    );
  };

  const nameOf = (pid) => patients.find((p) => p.id === pid)?.name || "";

  // ------------------------------ Views ------------------------------
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r bg-white md:block ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-sm font-semibold leading-tight">
                Doctor Portal
              </div>
              <div className="text-xs text-zinc-500">Mental Health</div>
            </div>
          )}
          <button
            className="ml-auto rounded-xl border p-2 hover:bg-zinc-50"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Thu gọn"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="space-y-1 p-2">
          {[
            { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
            { key: "patients", label: "Bệnh nhân", icon: Users },
            { key: "messages", label: "Nhắn tin", icon: MessageSquareText },
            { key: "calendar", label: "Lịch khám", icon: CalendarDays },
            { key: "homework", label: "Bài tập", icon: NotebookPen },
            { key: "notifications", label: "Thông báo", icon: Bell },
            { key: "settings", label: "Cài đặt", icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setNav(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-zinc-50 ${
                nav === key ? "bg-zinc-100" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {sidebarOpen && <span>{label}</span>}
              {key === "requests" &&
                callRequests.some((r) => r.status === "pending") && (
                  <span className="ml-auto text-xs">
                    {callRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-xl border bg-zinc-50 p-3 text-xs text-zinc-600">
            <div className="mb-1 font-medium">Trạng thái</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
            </div>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1300px] px-4 py-5">
        {/* Header */}
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white md:hidden">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold capitalize">{labelOf(nav)}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-64 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
                placeholder="Tìm bệnh nhân, ghi chú…"
              />
            </div>
            <IconBtn icon={Bell} onClick={() => setNav("notifications")}>
              Thông báo
            </IconBtn>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-zinc-800 text-white">
                Đ
              </div>
              <div className="hidden text-sm md:block">
                <div className="font-medium">Dr. Đặng</div>
                <div className="text-xs text-zinc-500">Tâm lý trị liệu</div>
              </div>
              <ChevronDown className="ml-1 h-4 w-4 text-zinc-500" />
            </div>
          </div>
        </header>

        {/* Routed Views */}
        {nav === "dashboard" && (
          <Dashboard
            stats={stats}
            patients={patients}
            calls={calls}
            callRequests={callRequests}
            setNav={setNav}
            setActivePatientId={setActivePatientId}
          />
        )}

        {nav === "patients" && (
          <PatientsView
            patients={patients}
            setPatients={setPatients}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
            onAssign={() => setOpenAssignModal(true)}
            onSchedule={() => {
              setScheduleDraft({
                patientId: activePatientId,
                time: addDaysISO(0, new Date().getHours() + 2),
              });
              setOpenScheduleModal(true);
            }}
          />
        )}

        {nav === "messages" && (
          <MessagesView
            patients={patients}
            setPatients={setPatients}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
            onSend={sendMsg}
          />
        )}

        {nav === "calendar" && (
          <CalendarView
            calls={calls}
            availability={availability}
            patients={patients}
            onAddAvail={addAvail}
          />
        )}

        {nav === "homework" && (
          <HomeworkView
            patients={patients}
            setPatients={setPatients}
            onMark={markAssignment}
            onAssignOpen={() => setOpenAssignModal(true)}
          />
        )}

        {nav === "notifications" && (
          <NotificationsView
            notifications={notifications}
            onMarkAll={() =>
              setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))
            }
          />
        )}

        {nav === "settings" && (
          <SettingsView availability={availability} onAddAvail={addAvail} />
        )}
      </main>

      {/* Assign Homework Modal */}
      <Modal
        open={openAssignModal}
        title={`Giao bài tập cho ${activePatient?.name || "bệnh nhân"}`}
        onClose={() => setOpenAssignModal(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <IconBtn
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              icon={X}
              onClick={() => setOpenAssignModal(false)}
            >
              Hủy
            </IconBtn>
            <IconBtn
              className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
              icon={Check}
              disabled={
                mode === "template"
                  ? !templatePick
                  : customTitle.trim().length < 3
              }
              onClick={() => {
                const payload =
                  mode === "template"
                    ? {
                        patientId: activePatientId,
                        templateCode: templatePick,
                        due: templateDue,
                      }
                    : {
                        patientId: activePatientId,
                        due: templateDue,
                        custom: {
                          title: customTitle.trim(),
                          description: customDesc.trim(),
                          difficulty: customDifficulty,
                          duration: customDuration.trim(),
                          target: customTargets
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      };
                assignHomework(payload);
                setOpenAssignModal(false);
              }}
            >
              Xác nhận giao bài
            </IconBtn>
          </div>
        }
      >
        {/** ---------- STATE BỔ SUNG ---------- */}
        {/** Đặt các useState này gần nơi bạn khai báo state khác: 
      const [mode, setMode] = useState("template"); // "template" | "custom"
      const [templateSearch, setTemplateSearch] = useState("");
      const [customTitle, setCustomTitle] = useState("");
      const [customDesc, setCustomDesc] = useState("");
      const [customDifficulty, setCustomDifficulty] = useState("Dễ"); // Dễ | Trung bình | Khó
      const [customDuration, setCustomDuration] = useState("10–15 phút");
      const [customTargets, setCustomTargets] = useState(""); // nhập tag, cách nhau dấu phẩy
  */}
        <div className="space-y-4">
          {/* Tabs chọn chế độ */}
          <div className="inline-flex rounded-xl border border-zinc-200 p-1 bg-zinc-50">
            <button
              type="button"
              onClick={() => setMode("template")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "template"
                  ? "bg-white border border-zinc-200 font-medium"
                  : "text-zinc-600"
              }`}
            >
              Mẫu có sẵn
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "custom"
                  ? "bg-white border border-zinc-200 font-medium"
                  : "text-zinc-600"
              }`}
            >
              Tự nhập
            </button>
          </div>

          {/* Due date */}
          <div className="pt-1">
            <label className="block text-sm font-medium">Hạn nộp</label>
            <input
              type="datetime-local"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              value={toLocalInputValue(templateDue)}
              onChange={(e) =>
                setTemplateDue(fromLocalInputValue(e.target.value))
              }
            />
          </div>

          {/* Mode: TEMPLATE */}
          {mode === "template" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Chọn mẫu bài tập
              </label>

              <div className="relative">
                <input
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Tìm mẫu theo tên, tag…"
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[50vh] overflow-auto">
                {HOMEWORK_TEMPLATES.filter((t) => {
                  const q = templateSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    t.name.toLowerCase().includes(q) ||
                    (t.target || []).some((tg) =>
                      String(tg).toLowerCase().includes(q)
                    )
                  );
                }).map((t) => (
                  <button
                    key={t.code}
                    className={`rounded-2xl border p-4 text-left hover:bg-zinc-50 ${
                      templatePick === t.code
                        ? "border-zinc-900"
                        : "border-zinc-200"
                    }`}
                    onClick={() => setTemplatePick(t.code)}
                  >
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Độ khó: {t.difficulty} • Thời lượng: {t.duration}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(t.target || []).map((tg) => (
                        <Badge key={tg} tone="info">
                          {tg}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode: CUSTOM */}
          {mode === "custom" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  Tiêu đề bài tập <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: Nhật ký cảm xúc 3 ngày"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Hướng dẫn / Nội dung
                </label>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                  placeholder={`VD:
- Ghi lại 3 cảm xúc nổi bật mỗi ngày
- Sự kiện kích hoạt
- Ý nghĩ tự động
- Hành vi/Phản ứng
- Mức độ (0–10)`}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Độ khó</label>
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value)}
                  >
                    <option>Dễ</option>
                    <option>Trung bình</option>
                    <option>Khó</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Thời lượng
                  </label>
                  <input
                    type="text"
                    className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                    placeholder="VD: 10–15 phút"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Nhóm mục tiêu (tags)
                  </label>
                  <input
                    type="text"
                    className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                    placeholder="VD: lo âu, trầm cảm"
                    value={customTargets}
                    onChange={(e) => setCustomTargets(e.target.value)}
                  />
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Nhiều tag cách nhau bởi dấu phẩy.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Schedule Call Modal */}
      <Modal
        open={openScheduleModal}
        title="Lên lịch cuộc gọi"
        onClose={() => setOpenScheduleModal(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <IconBtn
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              icon={X}
              onClick={() => setOpenScheduleModal(false)}
            >
              Hủy
            </IconBtn>
            <IconBtn
              className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
              icon={Check}
              onClick={() => {
                scheduleCall({
                  patientId: scheduleDraft.patientId || activePatientId,
                  time: scheduleDraft.time,
                });
                setOpenScheduleModal(false);
              }}
            >
              Xác nhận lịch
            </IconBtn>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Chọn bệnh nhân</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={scheduleDraft.patientId || activePatientId}
              onChange={(e) =>
                setScheduleDraft((s) => ({ ...s, patientId: e.target.value }))
              }
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Thời gian</label>
            <input
              type="datetime-local"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              value={toLocalInputValue(scheduleDraft.time)}
              onChange={(e) =>
                setScheduleDraft((s) => ({
                  ...s,
                  time: fromLocalInputValue(e.target.value),
                }))
              }
            />
            <div className="mt-2 text-xs text-zinc-500">Gợi ý khả dụng:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {availability.slice(0, 6).map((a) => (
                <button
                  key={a}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50"
                  onClick={() => setScheduleDraft((s) => ({ ...s, time: a }))}
                >
                  {fmtDateTime(a)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function labelOf(key) {
  switch (key) {
    case "dashboard":
      return "Tổng quan";
    case "patients":
      return "Bệnh nhân";
    case "messages":
      return "Nhắn tin";
    case "calls":
      return "Lịch gọi";
    case "requests":
      return "Yêu cầu lịch gọi";
    case "calendar":
      return "Lịch khám";
    case "homework":
      return "Bài tập trị liệu";
    case "notifications":
      return "Thông báo";
    case "settings":
      return "Cài đặt";
    default:
      return key;
  }
}

// ---------------------------- Dashboard ------------------------------
function Dashboard({
  stats,
  patients,
  calls,
  callRequests,
  setNav,
  setActivePatientId,
}) {
  const upcoming = useMemo(
    () =>
      calls
        .slice()
        .sort((a, b) => +new Date(a.time) - +new Date(b.time))
        .slice(0, 6),
    [calls]
  );
  const recentMsgs = useMemo(
    () =>
      patients
        .filter((p) => (p.messages || []).length)
        .map((p) => ({ ...p, lastMsg: p.messages[p.messages.length - 1] }))
        .sort((a, b) => +new Date(b.lastMsg.at) - +new Date(a.lastMsg.at))
        .slice(0, 6),
    [patients]
  );

  const riskPatients = useMemo(
    () =>
      patients.filter(
        (p) => p.latestTests?.PHQ9 >= 20 || p.latestTests?.GAD7 >= 15
      ),
    [patients]
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard
          icon={Users}
          label="Bệnh nhân"
          value={stats.total}
          hint="Tổng đang theo dõi"
        />
        <StatCard
          icon={MessageSquareText}
          label="Chat hoạt động"
          value={stats.activeChats}
          hint="Có tin nhắn chưa đọc"
        />
        <StatCard
          icon={PhoneCall}
          label="Cuộc gọi hôm nay"
          value={stats.upcomingToday}
          hint="Trong 24h"
        />
        <StatCard
          icon={CalendarClock}
          label="Yêu cầu chờ"
          value={stats.pendingReq}
          hint="Chưa xử lý"
        />
        <StatCard
          icon={ClipboardList}
          label="Bài tập đến hạn"
          value={stats.homeworkDueToday}
          hint="Hôm nay"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Upcoming calls */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cuộc gọi sắp tới</h3>
            <IconBtn icon={CalendarDays} onClick={() => setNav("calendar")}>
              Xem lịch
            </IconBtn>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <Empty
                icon={PhoneCall}
                title="Chưa có lịch"
                hint="Tạo lịch mới ở mục Lịch gọi"
              />
            )}
            {upcoming.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <Avatar name={c.patientId} patients={patients} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {nameOf(patients, c.patientId)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {fmtDateTime(c.time)} • 45 phút
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <IconBtn icon={Video}>Bắt đầu</IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent messages */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tin nhắn gần đây</h3>
            <IconBtn
              icon={MessageSquareText}
              onClick={() => setNav("messages")}
            >
              Vào hộp chat
            </IconBtn>
          </div>
          <div className="space-y-3">
            {recentMsgs.length === 0 && (
              <Empty
                icon={MessageSquareText}
                title="Chưa có tin nhắn"
                hint="Trao đổi với bệnh nhân để theo dõi"
              />
            )}
            {recentMsgs.map((p) => (
              <button
                key={p.id}
                className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50"
                onClick={() => {
                  setActivePatientId(p.id);
                  setNav("messages");
                }}
              >
                <Avatar name={p.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs text-zinc-500">
                    {p.lastMsg.sender === "doctor" ? "Bạn: " : "BN: "}
                    {p.lastMsg.text}
                  </div>
                </div>
                <div className="ml-auto text-xs text-zinc-400">
                  {fmtTime(p.lastMsg.at)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk & alerts */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cảnh báo nguy cơ</h3>
            <Badge tone="danger">Theo dõi sát</Badge>
          </div>
          <div className="space-y-3">
            {riskPatients.length === 0 && (
              <Empty
                icon={Activity}
                title="Không có ca nguy cơ"
                hint="Điểm test ở mức an toàn"
              />
            )}
            {riskPatients.map((p) => (
              <div key={p.id} className="rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} />
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-zinc-500">
                      PHQ-9 {p.latestTests.PHQ9} • GAD-7 {p.latestTests.GAD7}
                    </div>
                  </div>
                  <Badge tone="danger" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <Progress
                      value={p.latestTests.PHQ9}
                      max={27}
                      label="PHQ-9"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyPHQ9(p.latestTests.PHQ9).tone
                      )}`}
                    >
                      {classifyPHQ9(p.latestTests.PHQ9).label}
                    </div>
                  </div>
                  <div>
                    <Progress
                      value={p.latestTests.GAD7}
                      max={21}
                      label="GAD-7"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyGAD7(p.latestTests.GAD7).tone
                      )}`}
                    >
                      {classifyGAD7(p.latestTests.GAD7).label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-zinc-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
      {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

// ---------------------------- Patients -------------------------------
function PatientsView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onAssign,
  onSchedule,
}) {
  const ap = useMemo(
    () => patients.find((p) => p.id === activePatientId) || patients[0] || null,
    [patients, activePatientId]
  );

  // Dropdown chọn bệnh nhân (phải ngoài cùng) + tìm kiếm bên trong
  const [openPatientMenu, setOpenPatientMenu] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");

  const patientFiltered = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || "").toLowerCase().includes(q))
    );
  }, [patientQuery, patients]);

  // --- Modal trạng thái cho phần Bài tập ---
  const [viewA, setViewA] = useState(null); // xem chi tiết bài đã nộp
  const [feedbackA, setFeedbackA] = useState(null); // phản hồi bài đã nộp
  const [feedbackText, setFeedbackText] = useState("");
  const [editA, setEditA] = useState(null); // sửa bài khi CHƯA nộp
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");

  // Khi mở modal sửa
  const openEdit = (a) => {
    setEditA(a);
    setEditTitle(a.title || "");
    setEditDue(toLocalInputValue(a.dueDate || a.due));
  };

  // Cập nhật phản hồi
  const submitFeedback = () => {
    if (!ap || !feedbackA) return;
    setPatients((ps) =>
      ps.map((p) =>
        p.id === ap.id
          ? {
              ...p,
              assignments: (p.assignments || []).map((a) =>
                a.id === feedbackA.id
                  ? {
                      ...a,
                      feedback: {
                        text: feedbackText.trim(),
                        at: new Date().toISOString(),
                      },
                    }
                  : a
              ),
            }
          : p
      )
    );
    setFeedbackText("");
    setFeedbackA(null);
  };

  // Lưu sửa giao bài (khi CHƯA nộp)
  const saveEdit = () => {
    if (!ap || !editA) return;
    setPatients((ps) =>
      ps.map((p) =>
        p.id === ap.id
          ? {
              ...p,
              assignments: (p.assignments || []).map((a) =>
                a.id === editA.id
                  ? {
                      ...a,
                      title: editTitle.trim() || a.title,
                      dueDate: fromLocalInputValue(editDue),
                    }
                  : a
              ),
            }
          : p
      )
    );
    setEditA(null);
  };

  return (
    <div className="space-y-4">
      {/* Header: info + actions + dropdown chọn bệnh nhân ở phải ngoài cùng */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="ml-auto relative flex items-center gap-2">
          <IconBtn icon={NotebookPen} onClick={onAssign}>
            Giao bài tập
          </IconBtn>
          <IconBtn icon={PhoneCall} onClick={onSchedule}>
            Lên lịch gọi
          </IconBtn>
          {ap && (
            <IconBtn
              icon={MessageSquareText}
              onClick={() => setActivePatientId(ap.id)}
            >
              Mở chat
            </IconBtn>
          )}

          {ap ? (
            <div className="flex items-center gap-3">
              {/* Dropdown chọn bệnh nhân */}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => {
                  setOpenPatientMenu((v) => !v);
                  setPatientQuery("");
                }}
              >
                <Avatar name={ap.name} />
                <div>
                  <div className="text-base font-semibold">{ap.name}</div>
                  <div className="text-xs text-zinc-500">
                    {ap.gender} • {ap.age}t • {(ap.tags || []).join(" • ")}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-zinc-500">Chưa chọn bệnh nhân</div>
          )}

          {openPatientMenu && (
            <div
              className="absolute right-0 top-15 z-20 w-[360px] max-h-[70vh] overflow-auto rounded-xl border bg-white shadow-lg"
              onMouseLeave={() => setOpenPatientMenu(false)}
            >
              <div className="sticky top-0 bg-white p-2 border-b">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    autoFocus
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Tìm theo tên, tag…"
                    className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
              <div className="p-2">
                {patientFiltered.length === 0 && (
                  <div className="p-3 text-xs text-zinc-500">
                    Không tìm thấy kết quả
                  </div>
                )}
                {patientFiltered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePatientId(p.id);
                      setOpenPatientMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-zinc-50 ${
                      ap?.id === p.id ? "bg-zinc-50" : ""
                    }`}
                  >
                    <Avatar name={p.name} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.name}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {p.gender} • {p.age}t • {(p.tags || []).join(", ")}
                      </div>
                    </div>
                    {p.unread > 0 && (
                      <span className="ml-auto text-xs">
                        <Badge tone="info">{p.unread}</Badge>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung chính */}
      {!ap ? (
        <Empty icon={Users} title="Chưa chọn bệnh nhân" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Tests */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Kết quả bài test</h3>
              <Badge tone="info">PHQ-9 • GAD-7</Badge>
            </div>
            <div className="space-y-3">
              <div>
                <Progress
                  value={ap.latestTests?.PHQ9 ?? 0}
                  max={27}
                  label="PHQ-9"
                />
                <div
                  className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                    classifyPHQ9(ap.latestTests?.PHQ9 ?? 0).tone
                  )}`}
                >
                  {classifyPHQ9(ap.latestTests?.PHQ9 ?? 0).label}
                </div>
              </div>
              <div>
                <Progress
                  value={ap.latestTests?.GAD7 ?? 0}
                  max={21}
                  label="GAD-7"
                />
                <div
                  className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                    classifyGAD7(ap.latestTests?.GAD7 ?? 0).tone
                  )}`}
                >
                  {classifyGAD7(ap.latestTests?.GAD7 ?? 0).label}
                </div>
              </div>
            </div>
          </div>

          {/* Assignments — giống trang Homework */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bài tập trị liệu</h3>
              <IconBtn icon={NotebookPen} onClick={onAssign}>
                Giao bài
              </IconBtn>
            </div>

            <div className="space-y-2">
              {(ap.assignments || []).length === 0 && (
                <Empty
                  icon={ClipboardList}
                  title="Chưa có bài tập"
                  hint="Giao bài từ danh sách mẫu"
                />
              )}

              {(ap.assignments || []).map((a) => {
                const isSubmitted = !!a.submission?.submittedAt;
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border p-3"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">
                          {a.title}
                        </div>
                        <Badge tone={isSubmitted ? "info" : "warn"}>
                          {isSubmitted ? "Đã nộp" : "Chưa nộp"}
                        </Badge>
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        Hạn: {fmtDateTime(a.dueDate || a.due)}{" "}
                        {isSubmitted && a.submission?.submittedAt
                          ? `• Nộp: ${fmtDateTime(a.submission.submittedAt)}`
                          : ""}
                      </div>

                      {!!a.feedback?.text && (
                        <div className="mt-2 rounded-lg border bg-zinc-50 p-2 text-xs text-zinc-700">
                          <span className="font-medium">Phản hồi:</span>{" "}
                          {a.feedback.text}
                        </div>
                      )}
                    </div>

                    <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                      {isSubmitted ? (
                        <>
                          <IconBtn icon={FileText} onClick={() => setViewA(a)}>
                            Chi tiết
                          </IconBtn>
                          <IconBtn
                            icon={NotebookPen}
                            onClick={() => {
                              setFeedbackA(a);
                              setFeedbackText(a.feedback?.text || "");
                            }}
                          >
                            Phản hồi
                          </IconBtn>
                        </>
                      ) : (
                        <IconBtn icon={Pencil} onClick={() => openEdit(a)}>
                          Sửa
                        </IconBtn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 rounded-2xl border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ghi chú</h3>
              <Badge tone="default">
                Phiên gần nhất: {ap.nextCall ? fmtDate(ap.nextCall) : "—"}
              </Badge>
            </div>
            <textarea
              className="h-28 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={ap.notes}
              onBlur={(e) =>
                setPatients((ps) =>
                  ps.map((p) =>
                    p.id === ap.id ? { ...p, notes: e.target.value } : p
                  )
                )
              }
            />
          </div>
        </div>
      )}

      {/* ---------------- Modals cho phần Bài tập ---------------- */}

      {/* XEM CHI TIẾT BÀI NỘP */}
      {viewA && (
        <Modal
          open={!!viewA}
          title="Chi tiết bài nộp"
          onClose={() => setViewA(null)}
          footer={
            <div className="flex justify-end">
              <IconBtn onClick={() => setViewA(null)}>Đóng</IconBtn>
            </div>
          }
        >
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-zinc-500">Tiêu đề</div>
              <div className="font-medium">{viewA.title}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-zinc-500">Hạn nộp</div>
                <div className="font-medium">
                  {fmtDateTime(viewA.dueDate || viewA.due)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Thời điểm nộp</div>
                <div className="font-medium">
                  {fmtDateTime(viewA.submission?.submittedAt)}
                </div>
              </div>
            </div>
            {viewA.submission?.text && (
              <div>
                <div className="text-zinc-500">Nội dung</div>
                <div className="whitespace-pre-wrap rounded-xl border bg-zinc-50 p-3">
                  {viewA.submission.text}
                </div>
              </div>
            )}
            {!!(viewA.submission?.attachments || []).length && (
              <div>
                <div className="text-zinc-500">Tệp đính kèm</div>
                <ul className="list-disc pl-5">
                  {viewA.submission.attachments.map((f, i) => (
                    <li key={i}>
                      <a
                        className="text-indigo-600 hover:underline"
                        href={f.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {f.name || f.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* PHẢN HỒI BÀI NỘP */}
      {feedbackA && (
        <Modal
          open={!!feedbackA}
          title={`Phản hồi: ${feedbackA.title}`}
          onClose={() => {
            setFeedbackA(null);
            setFeedbackText("");
          }}
          footer={
            <div className="flex items-center justify-end gap-2">
              <IconBtn
                onClick={() => {
                  setFeedbackA(null);
                  setFeedbackText("");
                }}
              >
                Hủy
              </IconBtn>
              <IconBtn
                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={submitFeedback}
              >
                Gửi phản hồi
              </IconBtn>
            </div>
          }
        >
          <textarea
            rows={5}
            className="w-full rounded-2xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
            placeholder="Nhập phản hồi cho bài nộp…"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </Modal>
      )}

      {/* SỬA GIAO BÀI (khi CHƯA nộp) */}
      {editA && (
        <Modal
          open={!!editA}
          title={`Sửa giao bài: ${editA.title}`}
          onClose={() => setEditA(null)}
          footer={
            <div className="flex items-center justify-end gap-2">
              <IconBtn onClick={() => setEditA(null)}>Hủy</IconBtn>
              <IconBtn
                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={saveEdit}
              >
                Lưu
              </IconBtn>
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hạn nộp</label>
              <input
                type="datetime-local"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            {editA.description && (
              <div className="text-xs text-zinc-600">
                Mô tả hiện tại: {editA.description}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function MessagesView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onSend,
  onDoctorComplete, // optional
  onRespondComplete, // optional
}) {
  const [text, setText] = useState("");
  const ap = patients.find((p) => p.id === activePatientId) || patients[0];
  const msgs = ap?.messages || [];

  // Mark read khi mở hội thoại
  useEffect(() => {
    setPatients((ps) =>
      ps.map((p) => (p.id === ap?.id ? { ...p, unread: 0 } : p))
    );
  }, [ap?.id, setPatients]);

  const isCompleted = ap?.chatStatus === "completed";
  const pendingUserRequest =
    ap?.completeRequest?.status === "pending" &&
    ap?.completeRequest?.from === "user";

  // Bác sĩ chủ động bấm HOÀN THÀNH
  const handleDoctorComplete = () => {
    if (!ap) return;
    const ok = window.confirm(
      "Bạn có chắc chắn muốn hoàn thành khóa điều trị này?"
    );
    if (!ok) return;

    setPatients((ps) =>
      ps.map((p) => {
        if (p.id !== ap.id) return p;
        const sysMsg = {
          id: Math.random().toString(36).slice(2),
          sender: "system",
          text: "Bác sĩ đã đánh dấu HOÀN THÀNH khóa điều trị. Cảm ơn bạn đã trao đổi!",
          at: new Date().toISOString(),
        };
        return {
          ...p,
          chatStatus: "completed",
          // Nếu trước đó có pending từ user thì kết thúc luôn yêu cầu
          completeRequest: p.completeRequest
            ? { ...p.completeRequest, status: "accepted" }
            : {
                from: "doctor",
                status: "accepted",
                at: new Date().toISOString(),
              },
          messages: [...(p.messages || []), sysMsg],
        };
      })
    );

    // Callback ra ngoài (gửi backend)
    onDoctorComplete?.({ patientId: ap.id });
  };

  // Bác sĩ xử lý yêu cầu hoàn thành do user gửi lên
  const respondUserComplete = (decision) => {
    if (!ap) return;
    const ok = window.confirm(
      decision === "accept"
        ? "Xác nhận CHẤP NHẬN hoàn thành?"
        : "Xác nhận TỪ CHỐI hoàn thành?"
    );
    if (!ok) return;

    setPatients((ps) =>
      ps.map((p) => {
        if (p.id !== ap.id) return p;

        const accepted = decision === "accept";
        const sysMsg = {
          id: Math.random().toString(36).slice(2),
          sender: "system",
          text: accepted
            ? "Yêu cầu hoàn thành từ người dùng đã được CHẤP NHẬN. Phiên chat kết thúc."
            : "Yêu cầu hoàn thành từ người dùng đã bị TỪ CHỐI. Bạn có thể tiếp tục trao đổi.",
          at: new Date().toISOString(),
        };

        return {
          ...p,
          chatStatus: accepted ? "completed" : p.chatStatus || "active",
          completeRequest: {
            ...(p.completeRequest || { from: "user" }),
            status: accepted ? "accepted" : "rejected",
            at: new Date().toISOString(),
          },
          messages: [...(p.messages || []), sysMsg],
        };
      })
    );

    onRespondComplete?.({ patientId: ap.id, decision });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Sidebar: danh sách cuộc hội thoại */}
      <div>
        <div className="mb-2 text-sm font-semibold">Cuộc hội thoại</div>
        <div className="space-y-2">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePatientId(p.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50 ${
                ap?.id === p.id ? "border-zinc-900" : "border-zinc-200"
              }`}
            >
              <Avatar name={p.name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="truncate text-xs text-zinc-500">
                  {(p.messages || [])[p.messages?.length - 1]?.text || "—"}
                </div>
              </div>
              {p.unread > 0 && <Badge tone="info">{p.unread}</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Khung chat */}
      <div className="lg:col-span-2 rounded-2xl border bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b p-4">
          <Avatar name={ap?.name} />
          <div className="text-sm font-semibold">{ap?.name}</div>
          {isCompleted ? (
            <Badge tone="default">Đã hoàn thành</Badge>
          ) : (
            <Badge tone="success">Trực tuyến</Badge>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Nút HOÀN THÀNH thay cho gọi video; ẩn nếu đã hoàn thành */}
            {!isCompleted && (
              <IconBtn
                icon={CheckCircle2}
                onClick={handleDoctorComplete}
                className="border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800!"
              >
                Hoàn thành
              </IconBtn>
            )}
          </div>
        </div>

        {/* Banner xử lý yêu cầu hoàn thành từ User */}
        {pendingUserRequest && !isCompleted && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertTriangle className="mt-[2px] h-4 w-4" />
            <div className="flex-1">
              Người dùng đã gửi <b>yêu cầu hoàn thành</b> phiên trò chuyện này.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => respondUserComplete("reject")}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-amber-800 hover:bg-amber-100 text-xs inline-flex items-center gap-1"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                Từ chối
              </button>
              <button
                onClick={() => respondUserComplete("accept")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 text-xs inline-flex items-center gap-1"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Chấp nhận
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="h-[50vh] overflow-auto p-4">
          {msgs.length === 0 ? (
            <Empty icon={MessageSquareText} title="Chưa có tin nhắn" />
          ) : (
            <div className="space-y-2">
              {msgs.map((m) => {
                if (m.sender === "system") {
                  return (
                    <div
                      key={m.id}
                      className="mx-auto max-w-[80%] text-center text-xs text-zinc-600"
                    >
                      <div className="inline-block rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
                        {m.text}
                      </div>
                      <div className="mt-1 text-[10px] text-zinc-400">
                        {fmtTime(m.at)}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender === "doctor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        m.sender === "doctor"
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100"
                      }`}
                    >
                      <div>{m.text}</div>
                      <div className="mt-1 text-[10px] opacity-70">
                        {fmtTime(m.at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Composer (vẫn cho phép chat nếu chưa completed) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!ap || !text.trim()) return;
            onSend({ patientId: ap.id, text });
            setText("");
          }}
          className="flex items-center gap-2 border-t p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isCompleted ? "Phiên đã hoàn thành" : "Nhập tin nhắn…"}
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
            disabled={isCompleted}
          />
          <IconBtn
            icon={MessageSquareText}
            className="border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
            disabled={isCompleted}
          >
            Gửi
          </IconBtn>
        </form>
      </div>
    </div>
  );
}

/// ---------------------------- Calendar --------------------------------

// === MỖI CUỘC HẸN 45 PHÚT ===
const CALL_DURATION_MIN = 45;

function toYMD(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
function addMinutes(date, mins) {
  return new Date(date.getTime() + mins * 60 * 1000);
}
function toHHMM(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
function isSunday(date) {
  return date.getDay() === 0;
}

// Tìm tất cả cuộc hẹn có start trong khoảng [hour:00, hour+1:00) của một ngày
function findCallsInHour(calls, date, hour) {
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(hour + 1, 0, 0, 0);
  const sMs = start.getTime();
  const eMs = end.getTime();
  return (calls || []).filter((c) => {
    const cs = new Date(c.startISO || c.start || c.startAt).getTime();
    return cs >= sMs && cs < eMs;
  });
}

// Tuần T2..T7 (bỏ Chủ Nhật)
function startOfWeekNoSunday(ref = new Date()) {
  const d = new Date(ref);
  const day = d.getDay(); // 0 CN … 6 T7
  const diffToMon = (day + 6) % 7; // đưa về Thứ 2
  d.setDate(d.getDate() - diffToMon);
  d.setHours(0, 0, 0, 0);
  return d;
}
function buildWeekNoSunday(ref = new Date()) {
  const monday = startOfWeekNoSunday(ref);
  return Array.from(
    { length: 6 }, // T2..T7
    (_, i) =>
      new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  );
}
function dayLabel(d) {
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7"];
  const idx = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return `${dayNames[idx]}\n${d.getDate()}`;
}

function CalendarView({
  calls = [],
  patients = [],
  onCreateCall, // (payload) => void
  onJoinCall, // (call) => void
}) {
  // NEW: tuần đang hiển thị (mặc định tuần hiện tại)
  const [weekRef, setWeekRef] = React.useState(new Date());
  const week = buildWeekNoSunday(weekRef); // T2..T7
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 08:00 - 19:00

  // Lưu tạm lịch mới tạo để hiển thị ngay
  const [internalCalls, setInternalCalls] = React.useState([]);
  const allCalls = React.useMemo(() => {
    const map = new Map();
    [...(calls || []), ...internalCalls].forEach((c) => {
      const key = c.id || `${c.startISO || c.start}-${c.patientId || ""}`;
      if (!map.has(key)) map.set(key, c);
    });
    return [...map.values()];
  }, [calls, internalCalls]);

  // Modal đặt lịch
  const [open, setOpen] = React.useState(false);
  const [patientQuery, setPatientQuery] = React.useState("");
  const [pickedPatientId, setPickedPatientId] = React.useState("");
  const [pickDate, setPickDate] = React.useState(toYMD(new Date()));
  const [pickTime, setPickTime] = React.useState("09:00"); // bước 5’

  // Tính start/end hiển thị
  const { startDT, endDT, endLabel } = React.useMemo(() => {
    if (!pickDate || !pickTime)
      return { startDT: null, endDT: null, endLabel: "—" };
    const start = new Date(`${pickDate}T${pickTime}:00`);
    const end = addMinutes(start, CALL_DURATION_MIN);
    const nextDay = end.getDate() !== start.getDate();
    return {
      startDT: start,
      endDT: end,
      endLabel: `${toHHMM(end)}${nextDay ? " (+1 ngày)" : ""}`,
    };
  }, [pickDate, pickTime]);

  const filteredPatients = React.useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || "").toLowerCase().includes(q))
    );
  }, [patientQuery, patients]);

  const openBookModal = () => {
    setOpen(true);
    setPatientQuery("");
    setPickedPatientId("");
    setPickDate(toYMD(new Date()));
    setPickTime("09:00");
  };

  const confirmCreate = () => {
    if (!pickedPatientId || !startDT || !endDT) return;
    if (isSunday(startDT)) {
      alert("Đã bỏ Chủ Nhật khỏi lịch. Vui lòng chọn ngày T2–T7.");
      return;
    }

    const payload = {
      id: `local_${startDT.getTime()}_${pickedPatientId}`,
      patientId: pickedPatientId,
      startISO: startDT.toISOString(),
      endISO: endDT.toISOString(), // tự động = start + 45'
      roomId: `room_${startDT.getTime()}`,
      status: "scheduled",
      durationMin: CALL_DURATION_MIN,
    };

    // 1) Hiển thị ngay
    setInternalCalls((prev) => [payload, ...prev]);

    // 2) Chuyển view sang tuần chứa ngày vừa đặt (để chắc chắn thấy slot)
    setWeekRef(startDT);

    // 3) Gọi parent/backend nếu có
    if (typeof onCreateCall === "function") {
      onCreateCall(payload);
    }

    setOpen(false);
  };

  const joinCall = (call) => {
    if (typeof onJoinCall === "function") return onJoinCall(call);
    const rid = call.roomId || call.id || "demo";
    window.open(`/call/${rid}`, "_blank");
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Tuần này</h3>
          <Badge tone="default">
            {fmtDate(week[0])} → {fmtDate(week[5])}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* (tuỳ chọn) nút lùi/tiến tuần */}
          <IconBtn
            onClick={() =>
              setWeekRef(
                (d) => new Date(startOfWeekNoSunday(d).getTime() - 7 * 864e5)
              )
            }
          >
            ←
          </IconBtn>
          <IconBtn onClick={() => setWeekRef(new Date())}>Hôm nay</IconBtn>
          <IconBtn
            onClick={() =>
              setWeekRef(
                (d) => new Date(startOfWeekNoSunday(d).getTime() + 7 * 864e5)
              )
            }
          >
            →
          </IconBtn>

          <IconBtn
            icon={CalendarPlus}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={openBookModal}
          >
            Đặt lịch
          </IconBtn>
        </div>
      </div>

      {/* Header cột ngày (1 cột Giờ + 6 cột ngày = 7 cột) */}
      <div className="grid grid-cols-7 border-t text-xs">
        <div className="sticky left-0 z-10 bg-white p-2 font-medium">Giờ</div>
        {week.map((d) => (
          <div
            key={d.toISOString()}
            className="p-2 text-center font-medium whitespace-pre"
          >
            {dayLabel(d)}
          </div>
        ))}
      </div>

      {/* Body các khung giờ */}
      {hours.map((h) => (
        <div key={h} className="grid grid-cols-7 border-t">
          <div className="sticky left-0 z-10 bg-white p-2 text-xs text-zinc-500">
            {String(h).padStart(2, "0")}:00
          </div>
          {week.map((d) => (
            <CalendarCell
              key={d.toISOString() + h}
              date={d}
              hour={h}
              calls={allCalls}
              patients={patients}
              onJoinCall={joinCall}
            />
          ))}
        </div>
      ))}

      {/* Modal đặt lịch */}
      <Modal
        open={open}
        title={`Đặt lịch hẹn • ${CALL_DURATION_MIN} phút`}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <IconBtn
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setOpen(false)}
            >
              Hủy
            </IconBtn>
            <IconBtn
              className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-500!"
              onClick={confirmCreate}
              disabled={!pickedPatientId || !pickDate || !pickTime}
            >
              Xác nhận
            </IconBtn>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Chọn bệnh nhân + search */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-600">
              Chọn bệnh nhân
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Tìm theo tên, tag…"
                className="h-10 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            <div className="mt-2 max-h-48 overflow-auto rounded-xl border">
              {filteredPatients.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPickedPatientId(p.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                      pickedPatientId === p.id ? "bg-zinc-200" : ""
                    }`}
                  >
                    <Avatar name={p.name} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.name}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {p.gender} • {p.age}t • {(p.tags || []).join(", ")}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ngày */}
          <div>
            <label className="block text-xs text-zinc-600">Ngày</label>
            <input
              type="date"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={pickDate}
              onChange={(e) => setPickDate(e.target.value)}
            />
            {pickDate && isSunday(new Date(`${pickDate}T00:00:00`)) && (
              <div className="mt-1 text-[11px] text-rose-600">
                Lịch không hiển thị Chủ Nhật. Vui lòng chọn T2–T7.
              </div>
            )}
          </div>

          {/* Giờ bắt đầu (bước 5 phút) + Giờ kết thúc tự động */}
          <div>
            <label className="block text-xs text-zinc-600">Giờ bắt đầu</label>
            <input
              type="time"
              step={300} // 300s = 5 phút
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={pickTime}
              onChange={(e) => setPickTime(e.target.value)}
            />
            <div className="mt-2 text-xs text-zinc-600">
              Giờ kết thúc (tự động):{" "}
              <span className="font-medium">{endLabel}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Ô lịch: hiển thị mọi cuộc hẹn bắt đầu trong giờ
function CalendarCell({ date, hour, calls, patients, onJoinCall }) {
  const callsInHour = findCallsInHour(calls, date, hour);

  if (callsInHour.length > 0) {
    return (
      <div className="p-2 text-xs space-y-2">
        {callsInHour.map((call) => {
          const p = patients.find((x) => x.id === call.patientId) || {
            name: "Bệnh nhân",
          };
          return (
            <div
              key={call.id || call.startISO}
              className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-2 gap-1"
            >
              <div className="font-medium text-emerald-900 truncate">
                {p.name}
              </div>
              <div className="flex items-center justify-between flex-col">
                <div className="text-[11px] text-emerald-800">
                  {fmtTime(call.startISO || call.start)} –{" "}
                  {fmtTime(call.endISO || call.end)}
                </div>
                <IconBtn
                  icon={Video}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => onJoinCall && onJoinCall(call)}
                >
                  Vào phòng
                </IconBtn>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return <div className="h-16 p-2 text-[11px] text-zinc-300">—</div>;
}

// ---------------------------- Homework --------------------------------
function HomeworkView({
  patients,
  setPatients,
  onAssignOpen,
  onView, // optional: (assignment) => void
  onFeedback, // optional: (assignment) => void
  onEdit, // optional: (assignment) => void
}) {
  const all = useMemo(
    () =>
      (patients || []).flatMap((p) =>
        (p.assignments || []).map((a) => ({
          ...a,
          patientId: p.id,
          patientName: p.name,
        }))
      ),
    [patients]
  );

  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      all.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q.toLowerCase()) ||
          (a.patientName || "").toLowerCase().includes(q.toLowerCase())
      ),
    [all, q]
  );

  const isSubmitted = (a) =>
    a.submitted === true ||
    a.status === "đã nộp" ||
    a.status === "nộp bài" ||
    a.status === "submitted";

  const handleView = (a) => {
    if (typeof onView === "function") return onView(a);
    alert(`Xem chi tiết bài: ${a.title}\nCủa: ${a.patientName}`);
  };

  const handleFeedback = (a) => {
    if (typeof onFeedback === "function") return onFeedback(a);
    alert(`Gửi phản hồi cho: ${a.patientName}\nBài: ${a.title}`);
  };

  const handleEdit = (a) => {
    if (typeof onEdit === "function") return onEdit(a);
    alert(`Chỉnh sửa bài: ${a.title}\nCủa: ${a.patientName}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm bài tập hoặc bệnh nhân"
            className="h-10 w-72 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
          />
        </div>
        <IconBtn icon={Plus} onClick={onAssignOpen}>
          Giao bài mới
        </IconBtn>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 lg:grid-cols-2">
        {filtered.length === 0 && (
          <Empty icon={ClipboardList} title="Không có bài tập" />
        )}

        {filtered.map((a) => {
          const submitted = isSubmitted(a);
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-2xl border bg-white p-3"
            >
              <Avatar name={a.patientName} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{a.title}</div>
                <div className="truncate text-xs text-zinc-500">
                  {a.patientName} • Hạn: {fmtDateTime(a.dueDate || a.due)}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Badge tone={submitted ? "success" : "warn"}>
                  {submitted ? "đã nộp" : "chưa nộp"}
                </Badge>

                {submitted ? (
                  <>
                    <IconBtn
                      icon={Eye}
                      onClick={() => handleView(a)}
                      title="Xem chi tiết"
                    >
                      Xem
                    </IconBtn>
                    <IconBtn
                      icon={MessageSquareText}
                      onClick={() => handleFeedback(a)}
                      title="Phản hồi"
                    >
                      Phản hồi
                    </IconBtn>
                  </>
                ) : (
                  <IconBtn
                    icon={PencilLine}
                    onClick={() => handleEdit(a)}
                    title="Chỉnh sửa"
                  >
                    Chỉnh sửa
                  </IconBtn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------- Notifications -----------------------------
function NotificationsView({ notifications, onMarkAll }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Thông báo</div>
        <IconBtn icon={Check} onClick={onMarkAll}>
          Đánh dấu đã đọc
        </IconBtn>
      </div>
      <div className="space-y-2">
        {notifications.length === 0 && (
          <Empty icon={Bell} title="Không có thông báo" />
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              n.read ? "opacity-60" : ""
            }`}
          >
            <div
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                n.type === "success"
                  ? "bg-emerald-600 text-white"
                  : n.type === "warn"
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 text-white"
              }`}
            >
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm">{n.text}</div>
              <div className="text-xs text-zinc-500">{fmtDateTime(n.at)}</div>
            </div>
            {!n.read && <Badge tone="info">Mới</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- Settings -------------------------------
function SettingsView({ doctor, onSave, onCancel }) {
  const DEFAULT = useMemo(
    () => ({
      avatarUrl: "",
      fullName: "",
      role: "counselor",
      gender: "other",
      yearsExperience: 0,
      pricePerWeek: 0,
      specializations: [],
      modalities: [],
      certificates: [],
      bio: "",
    }),
    []
  );

  const init = { ...DEFAULT, ...(doctor || {}) };

  // ---------- State ----------
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(init.avatarUrl || "");
  const [fullName, setFullName] = useState(init.fullName || "");
  const [role, setRole] = useState(init.role || "counselor");
  const [gender, setGender] = useState(init.gender || "other");
  const [yearsExperience, setYearsExperience] = useState(
    Number(init.yearsExperience || 0)
  );
  const [pricePerWeek, setPricePerWeek] = useState(
    Number(init.pricePerWeek || 0)
  );
  const [specs, setSpecs] = useState((init.specializations || []).join(", "));
  const [mods, setMods] = useState((init.modalities || []).join(", "));
  const [certFiles, setCertFiles] = useState([]); // File[]
  const [existingCerts] = useState(init.certificates || []); // tên/link cũ (chỉ hiển thị)
  const [bio, setBio] = useState(init.bio || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ---------- Avatar preview URL cleanup ----------
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // ---------- Helpers ----------
  const parseCSV = (s) =>
    String(s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const formatVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(v || 0));

  const validate = () => {
    const e = {};
    if (fullName.trim().length < 3) e.fullName = "Họ tên tối thiểu 3 ký tự.";
    if (!["counselor", "therapist", "psychiatrist"].includes(role))
      e.role = "Vai trò không hợp lệ.";
    if (yearsExperience < 0 || yearsExperience > 60)
      e.yearsExperience = "Kinh nghiệm nên nằm trong khoảng 0–60 năm.";
    if (pricePerWeek < 0) e.pricePerWeek = "Giá/tuần không hợp lệ.";
    if (bio.length > 600) e.bio = "Giới thiệu tối đa 600 ký tự.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        // Thông tin văn bản
        fullName: fullName.trim(),
        role,
        gender,
        yearsExperience: Number(yearsExperience) || 0,
        pricePerWeek: Number(pricePerWeek) || 0,
        specializations: parseCSV(specs),
        modalities: parseCSV(mods),
        bio: bio.trim(),
        // Files (để backend xử lý upload):
        avatarFile: avatarFile || null, // File | null
        certificateFiles: certFiles, // File[]
      };
      await Promise.resolve(onSave && onSave(payload));
    } finally {
      setSaving(false);
    }
  };

  const Chips = ({ items, tone = "slate" }) => {
    const toneMap = {
      slate: "border-slate-200 bg-slate-50 text-slate-700",
      emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
      indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    };
    const cls = toneMap[tone] || toneMap.slate;
    return (
      <div className="flex flex-wrap gap-1.5">
        {(items || []).map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={`inline-block rounded-full border px-2 py-0.5 text-xs ${cls}`}
          >
            {t}
          </span>
        ))}
      </div>
    );
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Thanh tiêu đề gọn gàng */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Chỉnh sửa tài khoản bác sĩ</h2>
          <p className="text-xs text-slate-600">
            Cập nhật hồ sơ hiển thị cho bệnh nhân và thông tin dịch vụ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Lưới 2 cột gọn gàng */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột trái: Hồ sơ + Chứng chỉ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          {/* Hồ sơ chuyên môn */}
          <div className="space-y-4">
            <div className="text-sm font-semibold">Hồ sơ chuyên môn</div>

            {/* Avatar */}
            <div className="grid grid-cols-[96px,1fr] gap-3">
              <div className="rounded-full border border-slate-200 p-1 h-24 w-24 overflow-hidden bg-slate-50">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar xem trước"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                    Không ảnh
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-700">
                  Ảnh đại diện (tệp)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAvatarFile(f);
                  }}
                  className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:hover:bg-slate-50"
                />
                <div className="mt-1 text-xs text-slate-500">
                  JPG/PNG, đề nghị &lt; 2MB.
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Họ và tên <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: BS. Nguyễn An"
                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
              />
              {errors.fullName && (
                <div className="mt-1 text-xs text-rose-600">
                  {errors.fullName}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Vai trò
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="counselor">Chuyên viên tham vấn</option>
                  <option value="therapist">Nhà trị liệu tâm lý</option>
                  <option value="psychiatrist">Bác sĩ tâm thần</option>
                </select>
                {errors.role && (
                  <div className="mt-1 text-xs text-rose-600">
                    {errors.role}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Giới tính
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="other">Khác/Không nêu</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
                />
                {errors.yearsExperience && (
                  <div className="mt-1 text-xs text-rose-600">
                    {errors.yearsExperience}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Giới thiệu ngắn
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="2–3 câu về chuyên môn, cách tiếp cận trị liệu…"
                className="w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-slate-400"
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">{bio.length}/600</span>
                {errors.bio && (
                  <span className="text-rose-600">{errors.bio}</span>
                )}
              </div>
            </div>
          </div>

          {/* Chứng chỉ (file) */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Tài liệu & Chứng chỉ</div>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setCertFiles((prev) => [...prev, ...files]);
              }}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:hover:bg-slate-50"
            />
            {existingCerts.length > 0 && (
              <div className="text-xs text-slate-500">
                Tài liệu đã có:{" "}
                <span className="font-medium">
                  {existingCerts.map((c) => c).join(", ")}
                </span>
              </div>
            )}
            {certFiles.length > 0 && (
              <ul className="space-y-1 text-sm">
                {certFiles.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      onClick={() =>
                        setCertFiles((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-xs rounded-lg border border-slate-300 px-2 py-1 hover:bg-slate-50"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Cột phải: Dịch vụ & Giá + Chuyên môn/Phương pháp */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          {/* Dịch vụ & giá */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Dịch vụ & Giá</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Giá / tuần
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={pricePerWeek}
                  onChange={(e) => setPricePerWeek(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
                />
                <div className="mt-1 text-xs text-slate-500">
                  {formatVND(pricePerWeek)}
                </div>
                {errors.pricePerWeek && (
                  <div className="mt-1 text-xs text-rose-600">
                    {errors.pricePerWeek}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chuyên môn / Phương pháp */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">
              Chuyên môn & Phương pháp
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Chuyên môn (ngăn cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                placeholder="VD: trầm cảm, lo âu, mất ngủ"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
              />
              <div className="mt-2">
                <Chips items={parseCSV(specs)} tone="emerald" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Phương pháp trị liệu (ngăn cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                placeholder="VD: CBT, ACT, Mindfulness"
                value={mods}
                onChange={(e) => setMods(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-400"
              />
              <div className="mt-2">
                <Chips items={parseCSV(mods)} tone="indigo" />
              </div>
            </div>
          </div>

          {/* Tóm tắt xem nhanh */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-2 text-sm font-semibold">Xem nhanh</div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <div className="text-slate-500">Tên hiển thị</div>
                <div className="font-medium">{fullName || "—"}</div>
              </div>
              <div>
                <div className="text-slate-500">Vai trò</div>
                <div className="font-medium">
                  {
                    {
                      counselor: "Chuyên viên tham vấn",
                      therapist: "Nhà trị liệu tâm lý",
                      psychiatrist: "Bác sĩ tâm thần",
                    }[role]
                  }
                </div>
              </div>
              <div>
                <div className="text-slate-500">Kinh nghiệm</div>
                <div className="font-medium">{yearsExperience} năm</div>
              </div>
              <div>
                <div className="text-slate-500">Giá / tuần</div>
                <div className="font-medium">{formatVND(pricePerWeek)}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------- Utilities -------------------------------
function nameOf(listOrPatients, id) {
  const arr = Array.isArray(listOrPatients) ? listOrPatients : [];
  return arr.find((p) => p.id === id)?.name || id;
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function fromLocalInputValue(val) {
  // Treat as local time
  const d = new Date(val);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

function Avatar({ name, size = 9, patients }) {
  const label = typeof name === "string" ? name : nameOf(patients, name);
  const initials = (label || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`grid h-${size} w-${size} place-items-center rounded-full bg-zinc-900 text-white`}
    >
      <span className="text-xs">{initials}</span>
    </div>
  );
}
