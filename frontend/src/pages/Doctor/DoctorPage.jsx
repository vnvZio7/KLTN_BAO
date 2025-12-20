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
  Clock3,
  Paperclip,
  DollarSign,
  XIcon,
  RefreshCcwDotIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useUserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  convertDifficult,
  dateFormat,
  formatAge,
  prettyTime,
  reconvertDifficult,
} from "../../utils/helper";
import { THERAPY_METHODS } from "../../utils/data";
import toast from "react-hot-toast";
import { useRef } from "react";
import VideoCallPopup from "../../components/VideoCallPopup";
import { currencyVND } from "../../lib/utils";
import SessionDetailPopup from "../../components/SessionDetailPopup";

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

// month: 1-12
function calcWalletTotalByMonth(doctor, year, month) {
  const list = doctor?.walletBalance ?? [];
  const y = Number(year);
  const m = Number(month) + 1;

  let total = 0;

  list.map((item) => {
    {
      if (!item) return;

      const d = new Date(item.createdAt);
      if (Number.isNaN(d.getTime())) return;

      const itemYear = d.getFullYear();
      const itemMonth = d.getMonth() + 1;

      if (itemYear === y && itemMonth === m) {
        const amt = Number(item.amount ?? 0);
        if (Number.isFinite(amt)) total += amt;
      }
    }
  });

  return total;
}
function calcWalletTotalLastMonth(doctor, now = new Date()) {
  const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const m = now.getMonth() === 0 ? 12 : now.getMonth(); // vì getMonth() là 0-11, tháng trước sẽ là 1-12
  return calcWalletTotalByMonth(doctor, y, m);
}
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

// PHQ-9 classification (0–21)
function classifyPHQ9(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  return { label: "Nặng", tone: "danger" };
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
        <div className="max-h-[72vh] overflow-auto p-5">{children}</div>
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
  const {
    handleLogout,
    homeworkSubmissions,
    user,
    patients,
    rooms,
    exercises,
    assignments,
    appointments,
    sendMessage,
    onlineUsers,
    setAssignments,
    setHomeworkSubmissions,
    sessions,
    setPatients,
    notifications,
    setNotifications,
  } = useUserContext();
  console.log(user);
  const [mode, setMode] = useState("template"); // "template" | "custom"
  const [templateSearch, setTemplateSearch] = useState("");

  const [templateFilter, setTemplateFilter] = useState("all");

  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState("Dễ"); // Dễ | Trung bình | Khó
  const [customDuration, setCustomDuration] = useState(10);
  const [customMethod, setCustomMethod] = useState(THERAPY_METHODS[0]);
  const [customAttachments, setCustomAttachments] = useState([]);

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openCall, setOpenCall] = useState(false);
  const [callRoomId, setCallRoomId] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [openCallDetails, setOpenCallDetails] = useState(false);
  const [templatePick, setTemplatePick] = useState(exercises[0].code);
  const [templateDue, setTemplateDue] = useState(addDaysISO(3));

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nav, setNav] = useState("dashboard");

  const [activePatientId, setActivePatientId] = useState(patients[0]?.id);
  const activePatient = useMemo(
    () => patients.find((p) => p._id === activePatientId) || patients[0],
    [patients, activePatientId]
  );

  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    patientId: null,
    time: addDaysISO(0, new Date().getHours() + 2),
  });

  // Derived stats
  const stats = useMemo(() => {
    const total = patients.length;
    const activeChats = patients.filter((p) => (!p.read || 0) > 0).length;
    const upcomingToday = appointments.filter((c) => {
      if (c.status === "cancelled") return;
      return withinSameDay(c.startTime);
    }).length;
    const totalMonth = currencyVND(calcWalletTotalLastMonth(user));
    // patients.reduce(
    //   (acc, p) =>
    //     acc +
    //     p.assignments.filter(
    //       (a) => withinSameDay(a.due) && a.status !== "đã duyệt"
    //     ).length,
    //   0
    // );
    return { total, activeChats, upcomingToday, totalMonth };
  }, [patients, appointments]);

  // ---------------------- Actions (mocked) ----------------------
  const notify = (text, type = "info") =>
    setNotifications((n) => [
      { id: uid(), type, text, at: todayISO(), read: false },
      ...n,
    ]);

  const onCreateCall = async (payload) => {
    try {
      const { roomId, startTime, endTime } = payload;
      const res = await axiosInstance.post(
        API_PATHS.APPOINTMENTS.CREATE_APPOINTMENT,
        {
          roomId,
          startTime,
          endTime,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
      return { check: true, appointment: res.data.appointment };
    } catch (error) {
      toast.error(error.response.data.message);
    }
    // notify(`Đã thêm khung giờ khả dụng ${fmtDateTime(startTime)}`, "info");
  };

  const assignHomework = ({ patientId, templateCode, due }) => {
    const tpl = exercises.find((t) => t._id === templateCode);
    if (!tpl) return;
    // setPatients((ps) =>
    //   ps.map((p) =>
    //     p._id === patientId
    //       ? {
    //           ...p,
    //           assignments: [
    //             {
    //               id: uid(),
    //               code: tpl.code,
    //               title: tpl.name,
    //               due,
    //               status: "chưa làm",
    //             },
    //             ...p.assignments,
    //           ],
    //         }
    //       : p
    //   )
    // );
    notify(
      `Đã giao bài tập “${tpl.name}” cho ${nameOf(patientId)} (hạn ${fmtDate(
        due
      )})`,
      "success"
    );
  };

  function validateHomeworkPayload({
    title,
    content,
    difficulty,
    duration,
    method,
    attachments,
    due,
  }) {
    // Title
    if (!title || title.trim().length < 3) {
      return "Tiêu đề quá ngắn (tối thiểu 3 ký tự).";
    }

    // Content
    if (!content || content.trim().length < 10) {
      return "Nội dung / Hướng dẫn quá ngắn (tối thiểu 10 ký tự).";
    }
    if (!THERAPY_METHODS.includes(method)) {
      return "Phương pháp trị liệu không hợp lệ.";
    }

    // Difficulty
    const DIFFICULTIES = ["easy", "medium", "hard"];
    if (!DIFFICULTIES.includes(difficulty)) {
      return "Độ khó không hợp lệ.";
    }

    // Duration MUST be number
    if (typeof duration !== "number" || isNaN(duration) || duration < 1) {
      return "Thời lượng phải là số phút hợp lệ (>= 1).";
    }

    // Attachments
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        if (!(file instanceof File)) {
          return "Tệp đính kèm phải là file hợp lệ.";
        }
        if (file.size > 20 * 1024 * 1024) {
          return `File "${file.name}" vượt quá giới hạn 20MB.`;
        }
      }
    }

    // Due date
    if (!due) return "Bạn chưa chọn hạn nộp.";

    const dueDate = new Date(due);
    if (dueDate <= new Date()) {
      return "Hạn nộp phải lớn hơn thời điểm hiện tại.";
    }

    return null; // hợp lệ
  }

  const markAssignment = ({ patientId, assignmentId, status }) => {
    // setPatients((ps) =>
    //   ps.map((p) =>
    //     p._id === patientId
    //       ? {
    //           ...p,
    //           assignments: p.assignments.map((a) =>
    //             a.id === assignmentId ? { ...a, status } : a
    //           ),
    //         }
    //       : p
    //   )
    // );
  };

  const nameOf = (pid) => patients.find((p) => p._id === pid)?.name || "";

  const ap = useMemo(
    () =>
      patients.find((p) => p._id === activePatientId) || patients[0] || null,
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
        p.accountId.fullName.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || "").toLowerCase().includes(q))
    );
  }, [patientQuery, patients]);
  // ------------------------------ Views ------------------------------
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {openCall ? (
        <VideoCallPopup
          key="call-popup" // ép React unmount đúng 1 lần
          roomId={callRoomId}
          open={true}
          onClose={() => {
            setCallRoomId(null);
            setOpenCall(false);
          }}
          isDoctor={true}
        />
      ) : null}
      {openCallDetails ? (
        <SessionDetailPopup
          open={true}
          onClose={() => {
            setSessionData([]);
            setOpenCallDetails(false);
          }}
          session={sessionData}
        />
      ) : null}

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
                {user.accountId.fullName || "Doctor"}
              </div>
              <div className="text-xs text-zinc-500">
                {user.accountId.email || "Doctor"}
              </div>
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
              {key === "calendar" &&
                appointments.some((r) => r.status === "pending") && (
                  <span className="ml-auto text-xs">
                    {appointments.filter((r) => r.status === "pending").length}
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
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1300px] px-4 py-5">
        {/* Header */}
        <header className="mb-5 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white md:hidden">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold capitalize">{labelOf(nav)}</h1>
          </div>
          {(nav == "patients" || nav === "homework") &&
            (ap ? (
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
                  <Avatar name={ap.accountId.fullName} />
                  <div>
                    <div className="text-base font-semibold">
                      {ap.accountId.fullName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {ap.accountId.gender} •{" "}
                      {formatAge(ap.accountId.birthDate)}t •{" "}
                      {ap.dominantSymptom}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-zinc-500">Chưa chọn bệnh nhân</div>
            ))}
          {openPatientMenu && (
            <div
              className="absolute right-0 top-20 z-20 w-[360px] max-h-[70vh] overflow-auto rounded-xl border bg-white shadow-lg"
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
                    key={p._id}
                    onClick={() => {
                      setActivePatientId(p._id);
                      setOpenPatientMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-zinc-50 ${
                      ap?.id === p._id ? "bg-zinc-50" : ""
                    }`}
                  >
                    <Avatar name={p.accountId.fullName} />
                    <div>
                      <div className="text-base font-semibold">
                        {p.accountId.fullName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {p.accountId.gender} •{" "}
                        {formatAge(p.accountId.birthDate)}t •{" "}
                        {p.dominantSymptom}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Routed Views */}
        {nav === "dashboard" && (
          <Dashboard
            stats={stats}
            patients={patients}
            rooms={rooms}
            calls={appointments}
            setNav={setNav}
            sessions={sessions}
            setActivePatientId={setActivePatientId}
            setOpenCall={setOpenCall}
            setCallRoomId={setCallRoomId}
          />
        )}

        {nav === "patients" && (
          <PatientsView
            patients={patients}
            setPatients={setPatients}
            setNav={setNav}
            assignments={assignments}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
          />
        )}

        {nav === "messages" && (
          <MessagesView
            patients={patients}
            rooms={rooms}
            activeId={activePatientId}
            onlineUsers={onlineUsers}
          />
        )}

        {nav === "calendar" && (
          <CalendarView
            calls={appointments}
            rooms={rooms}
            patients={patients}
            onCreateCall={onCreateCall}
            setOpenCall={setOpenCall}
            setOpenCallDetails={setOpenCallDetails}
            sessions={sessions}
            setCallRoomId={setCallRoomId}
            setSessionData={setSessionData}
          />
        )}

        {nav === "homework" && (
          <HomeworkView
            assignments={assignments}
            homeworkSubmissions={homeworkSubmissions}
            patients={patients}
            activePatientId={activePatientId}
            setAssignments={setAssignments}
            setHomeworkSubmissions={setHomeworkSubmissions}
            // setPatients={setPatients}
            onMark={markAssignment}
            onAssignOpen={() => setOpenAssignModal(true)}
          />
        )}

        {nav === "notifications" && (
          <NotificationsView
            notifications={notifications}
            onMarkAll={async () => {
              await axiosInstance.patch(API_PATHS.NOTIFY.UPDATE_MARK_ALL_READ);
              setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
            }}
          />
        )}

        {nav === "settings" && <SettingsView doctor={user} />}
      </main>

      {/* Assign Homework Modal */}
      <Modal
        open={openAssignModal}
        title={`Giao bài tập cho ${
          activePatient?.accountId?.fullName || "bệnh nhân"
        }`}
        onClose={() => setOpenAssignModal(false)}
        footer={
          mode === "custom" ? (
            <div className="flex items-center justify-end gap-2">
              <IconBtn
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                icon={X}
                onClick={() => setOpenAssignModal(false)}
              >
                Hủy
              </IconBtn>
              <IconBtn
                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700! hover:text-white"
                icon={Check}
                onClick={async () => {
                  // Luôn gửi dưới dạng "custom", có kèm theo templateCode nếu có
                  console.log("payload");
                  const payload = {
                    userId: activePatient._id,
                    doctorId: user._id,
                    title: customTitle.trim(),
                    content: customDesc.trim(),
                    difficulty: reconvertDifficult(customDifficulty),
                    dueDate: templateDue,
                    duration: customDuration,
                    method: customMethod,
                  };
                  const error = validateHomeworkPayload({
                    title: payload.title,
                    content: payload.content,
                    difficulty: payload.difficulty,
                    attachments: customAttachments,
                    due: payload.dueDate,
                    duration: payload.duration,
                    method: payload.method,
                  });

                  if (error) {
                    alert(error);
                    return;
                  }
                  try {
                    // 2. Tạo FormData để gửi cả JSON + file
                    const formData = new FormData();

                    // Gửi object assignment dưới dạng JSON string
                    formData.append("payload", JSON.stringify(payload));

                    // Gửi từng file đính kèm
                    (customAttachments || []).forEach((file) => {
                      formData.append("attachments", file); // backend: req.files["attachments"]
                    });

                    // 3. Gửi request lên backend
                    const res = await axiosInstance.post(
                      API_PATHS.HOMEWORK_ASSIGNMENTS.CREATE_HOMEWORK_ASSIGNMENT,
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    const newAssignment =
                      res.data.homeworkAssignment ||
                      res.data.data?.homeworkAssignment ||
                      res.homeworkAssignment;
                    // 🚀 Thêm vào danh sách assignments trong UI
                    setAssignments((prev) => [...prev, newAssignment]);
                    toast.success("Giao bài tập thành công");
                  } catch (error) {
                    toast.error(error.message);
                  }
                  // assignHomework(payload);
                  setOpenAssignModal(false);
                }}
              >
                Xác nhận giao bài
              </IconBtn>
            </div>
          ) : (
            <div className="mb-5"></div>
          )
        }
      >
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

          {/* MODE: MẪU CÓ SẴN */}
          {mode === "template" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Chọn mẫu bài tập
              </label>

              {/* Thanh tìm kiếm + filter Lo âu / Trầm cảm */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Tìm mẫu theo tên…"
                    className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Nhóm nút filter */}
                <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setTemplateFilter("all")}
                    className={`px-3 py-1 rounded-lg ${
                      templateFilter === "all"
                        ? "bg-white border border-zinc-200 font-medium"
                        : "text-zinc-600"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateFilter("lo-au")}
                    className={`px-3 py-1 rounded-lg ${
                      templateFilter === "lo-au"
                        ? "bg-white border border-zinc-200 font-medium"
                        : "text-zinc-600"
                    }`}
                  >
                    Lo âu
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateFilter("tram-cam")}
                    className={`px-3 py-1 rounded-lg ${
                      templateFilter === "tram-cam"
                        ? "bg-white border border-zinc-200 font-medium"
                        : "text-zinc-600"
                    }`}
                  >
                    Trầm cảm
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[45vh] overflow-auto">
                {exercises
                  .filter((t) => {
                    const q = templateSearch.trim().toLowerCase();

                    // --- 1) Chỉ lọc theo tên ---
                    const matchSearch = !q || t.title.toLowerCase().includes(q);

                    // --- 2) Lọc theo Lo âu / Trầm cảm ---
                    const tags = (t.targetSymptoms || []).map((tg) =>
                      tg.toLowerCase()
                    );
                    let matchFilter = true;
                    if (templateFilter === "lo-au") {
                      matchFilter = tags.includes("lo âu");
                    } else if (templateFilter === "tram-cam") {
                      matchFilter = tags.includes("trầm cảm");
                    }
                    return matchSearch && matchFilter;
                  })
                  .map((t) => (
                    <button
                      key={t._id}
                      className={`group rounded-2xl border p-4 text-left hover:bg-zinc-50 ${
                        templatePick === t._id
                          ? "border-zinc-900"
                          : "border-zinc-200"
                      }`}
                      onClick={() => {
                        // 👉 Khi chọn mẫu:
                        // 1) nhớ lại mã template
                        setTemplatePick(t._id);
                        // 2) đổ dữ liệu sang form Tự nhập
                        setCustomTitle(t.title || "");
                        setCustomDesc(t.content || "");
                        setCustomDifficulty(convertDifficult(t.difficulty));
                        setCustomDuration(t.estimatedMinutes || 10);
                        setCustomMethod(t.method || "");
                        setCustomAttachments(t.attachments || []);
                        // 3) chuyển sang tab Tự nhập
                        setMode("custom");
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-full">
                          <div className="flex  items-center gap-0.5">
                            <div className="text-sm flex-8 font-semibold w-full truncate">
                              {t.title}
                            </div>
                            <div className="text-xs flex-1.5 flex-nowrap">
                              <span>{t.estimatedMinutes} m</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            Độ khó: {convertDifficult(t.difficulty)}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            Phương pháp :{" "}
                            <span className="font-semibold">{t.method}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(t.targetSymptoms || []).map((tg) => (
                              <Badge key={tg} tone="info">
                                {tg}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* MODE: TỰ NHẬP – sẽ được prefill nếu chọn từ mẫu */}
          {mode === "custom" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  Tiêu đề bài tập <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: Nhật ký cảm xúc 3 ngày"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              {/* Hạn nộp */}
              <div className="pt-1">
                <label className="block text-sm font-medium">Hạn nộp</label>
                <input
                  type="datetime-local"
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  value={toLocalInputValue(templateDue)}
                  onChange={(e) => setTemplateDue(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Hướng dẫn / Nội dung
                </label>
                <textarea
                  rows={4}
                  className="placeholder:text-gray-400 mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
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
              {/* FILE ĐÍNH KÈM */}
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                  File đính kèm
                </label>

                {/* Ô upload có BORDER */}
                <div className="rounded-xl border border-zinc-300 bg-white p-1.5 pl-3 hover:border-zinc-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCustomAttachments(files);
                    }}
                  />
                </div>

                {/* Danh sách file đã chọn */}
                {customAttachments.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {customAttachments.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 hover:bg-zinc-100"
                      >
                        {/* Tên file */}
                        <span className="truncate max-w-[220px] text-sm text-zinc-700">
                          {f.name}
                        </span>

                        {/* Nút X xoá */}
                        <button
                          onClick={() =>
                            setCustomAttachments((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="ml-3 flex h-6 w-6 items-center justify-center rounded-md border border-zinc-300 text-xs text-zinc-700 hover:bg-white hover:border-zinc-400"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Độ khó */}
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

                {/* Thời lượng */}
                <div>
                  <label className="block text-sm font-medium">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                    placeholder="Số phút"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Phương pháp trị liệu
                  </label>
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                  >
                    {THERAPY_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
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
                  time: scheduleDraft.startTime,
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
                <option key={p._id} value={p._id}>
                  {p.accountId.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Thời gian</label>
            <input
              type="datetime-local"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              value={toLocalInputValue(scheduleDraft.startTime)}
              onChange={(e) =>
                setScheduleDraft((s) => ({
                  ...s,
                  time: fromLocalInputValue(e.target.value),
                }))
              }
            />
            <div className="mt-2 text-xs text-zinc-500">Gợi ý khả dụng:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {/* {availability.slice(0, 6).map((a) => (
                <button
                  key={a}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50"
                  onClick={() => setScheduleDraft((s) => ({ ...s, time: a }))}
                >
                  {fmtDateTime(a)}
                </button>
              ))} */}
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
  rooms,
  calls,
  setNav,
  sessions,
  setActivePatientId,
  setOpenCall,
  setCallRoomId,
}) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = now.getMonth();
    const dd = now.getDate();

    const startOfDay = new Date(yyyy, mm, dd, 0, 0, 0);
    const endOfDay = new Date(yyyy, mm, dd, 23, 59, 59, 999);
    const oneHourMs = 60 * 60 * 1000;
    const oneHourAgo = new Date(now.getTime() - oneHourMs);

    return calls
      .filter((call) => {
        if (call.status === "cancelled") return;
        const t = new Date(call.startTime);
        // chỉ lấy cuộc gọi trong ngày hôm nay
        return t >= startOfDay && t <= endOfDay;
      })
      .sort((a, b) => {
        const ta = new Date(a.startTime);
        const tb = new Date(b.startTime);

        // Xác định group cho từng cuộc gọi
        const groupOf = (t) => {
          if (t >= oneHourAgo && t <= now) return 0; // từ 1h trước -> hiện tại
          if (t > now && t <= endOfDay) return 1; // từ hiện tại -> hết ngày
          return 2; // trước 1h trước (đầu ngày tới < oneHourAgo)
        };

        const ga = groupOf(ta);
        const gb = groupOf(tb);

        if (ga !== gb) return ga - gb; // group nhỏ hơn đứng trước
        return ta - tb; // cùng group thì sort theo thời gian
      })
      .slice(0, 6);
  }, [calls]);

  const recentMsgs = useMemo(() => {
    if (!patients?.length || !rooms?.length) return [];

    // Tạo map: userId -> room
    const roomMap = new Map(rooms.map((r) => [String(r.userId), r]));

    return patients
      .map((p) => {
        const room = roomMap.get(String(p._id));
        if (!room || !room.lastMessage) return null;

        return {
          ...p,
          lastMsgText: room.lastMessage,
          lastMsgAt: room.lastMessageAt || room.updatedAt,
        };
      })
      .filter(Boolean) // bỏ mấy thằng null
      .sort(
        (a, b) =>
          new Date(b.lastMsgAt).getTime() - new Date(a.lastMsgAt).getTime()
      )
      .slice(0, 6);
  }, [patients, rooms]);

  const riskPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.testHistory.at(-2).totalScore >= 15 ||
          p.testHistory.at(-1).totalScore >= 15
      ),
    [patients]
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
          icon={ClipboardList}
          label="Doanh thu tháng"
          value={stats.totalMonth}
          hint={"Tháng " + (new Date().getMonth() + 1)}
          // hint={"Tháng " + new Date().getMonth()}
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
            {upcoming.map((c) => {
              const now = new Date();
              const nowMs = now.getTime();
              const fifteenMs = 15 * 60 * 1000;

              const start = new Date(c.startTime);
              const end = new Date(c.endTime);
              const startMs = start.getTime();
              const endMs = end.getTime();

              const status = c.status;
              const session =
                sessions.find(
                  (e) => e?.appointmentId?.toString() === c?._id?.toString()
                ) || null;
              const isCompleted =
                (status === "completed" || status === "complete") && session;
              const isPast = nowMs > endMs;
              const isSoon = nowMs < startMs - fifteenMs; // giống CalendarCell

              let canJoin = false;
              let btnLabel = "";

              // 🔹 Logic giống CalendarCell
              if (isSoon) {
                btnLabel = "Sắp diễn ra";
                canJoin = false;
              } else if (nowMs >= startMs - fifteenMs && nowMs <= endMs) {
                btnLabel = "Vào phòng";
                canJoin = true;
              } else if (isCompleted) {
                btnLabel = "Xem chi tiết";
                canJoin = true;
              } else {
                btnLabel = "Đã quá giờ";
                canJoin = false;
              }

              // 🔹 Tone màu card giống CalendarCell
              let cardTone = "border-sky-100 bg-sky-50"; // mặc định: chưa tới 15 phút
              if (canJoin && nowMs <= endMs) {
                cardTone = "border-emerald-200 bg-emerald-50";
              } else if (isCompleted) {
                cardTone = "border-zinc-200 bg-zinc-50";
              } else if (isPast && !isCompleted) {
                cardTone = "border-rose-200 bg-rose-50";
              }

              return (
                <div
                  key={c._id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${cardTone}`}
                >
                  <Avatar
                    name={c.roomId?.userId?.accountId?.fullName}
                    patients={patients}
                  />

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {nameOf(patients, c.roomId?.userId?._id)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {fmtDateTime(c.startTime)} • 45 phút
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <IconBtn
                      icon={Video}
                      className={`border text-[11px] px-3 py-1.5 
            ${
              canJoin
                ? "border-emerald-400 text-emerald-700 hover:bg-emerald-100"
                : isCompleted
                ? "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                : isPast
                ? "border-rose-300 text-rose-700 cursor-not-allowed"
                : "border-sky-300 text-sky-700 cursor-not-allowed"
            }
          `}
                      disabled={!canJoin && !isCompleted}
                      onClick={() => {
                        if (btnLabel === "Xem chi tiết" && isCompleted) {
                          setSessionData(session);
                          setOpenCallDetails(true);
                        }
                        if (
                          canJoin &&
                          btnLabel === "Vào phòng" &&
                          !isCompleted
                        ) {
                          setOpenCall(true);
                          setCallRoomId(call._id);
                        }
                      }}
                    >
                      {btnLabel}
                    </IconBtn>
                  </div>
                </div>
              );
            })}
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
                key={p._id}
                className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50"
                onClick={() => {
                  setActivePatientId(p._id);
                  setNav("messages");
                }}
              >
                <Avatar name={p.accountId.fullName} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {p.accountId.fullName}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {p.lastMsgAt ? prettyTime(p.lastMsgAt) : ""}
                  </div>
                </div>
                <div className="truncate text-xs text-zinc-500">
                  {p.lastMsgText}
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
              <div key={p._id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Avatar name={p.accountId.fullName} />
                    <div>
                      <div className="text-sm font-medium">
                        {p.accountId.fullName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        PHQ-9 {p.testHistory.at(-2).totalScore} • GAD-7{" "}
                        {p.testHistory.at(-1).totalScore}
                      </div>
                    </div>
                  </div>
                  <button
                    key={p._id}
                    className="flex items-center rounded-xl border py-1 px-2.5 text-left hover:bg-zinc-50"
                    onClick={() => {
                      setActivePatientId(p._id);
                      setNav("patients");
                    }}
                  >
                    Quản lý
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <Progress
                      value={p.testHistory.at(-2).totalScore}
                      max={21}
                      label="PHQ-9"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyPHQ9(p.testHistory.at(-2).totalScore).tone
                      )}`}
                    >
                      {classifyPHQ9(p.testHistory.at(-2).totalScore).label}
                    </div>
                  </div>
                  <div>
                    <Progress
                      value={p.testHistory.at(-1).totalScore}
                      max={21}
                      label="GAD-7"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyGAD7(p.testHistory.at(-1).totalScore).tone
                      )}`}
                    >
                      {classifyGAD7(p.testHistory.at(-1).totalScore).label}
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
  patients = [],
  assignments = [],
  setNav,
  activePatientId = patients[0]?._id || null,
  setPatients,
}) {
  const [notes, setNotes] = useState(
    patients[0].notes.sort((a, b) => {
      const ta = new Date(a?.createdAt ?? 0).getTime();
      const tb = new Date(b?.createdAt ?? 0).getTime();
      return tb - ta;
    }) || []
  );
  const [note, setNote] = useState("");
  const ap = useMemo(() => {
    const user =
      patients.find((p) => p._id === activePatientId) || patients[0] || null;
    setNotes(
      user.notes.sort((a, b) => {
        const ta = new Date(a?.createdAt ?? 0).getTime();
        const tb = new Date(b?.createdAt ?? 0).getTime();
        return tb - ta;
      })
    );
    return user;
  }, [patients, activePatientId]);
  console.log(ap);

  const ass = useMemo(
    () => assignments.filter((p) => p.userId === activePatientId),
    [assignments, activePatientId]
  );

  // Dropdown chọn bệnh nhân (phải ngoài cùng) + tìm kiếm bên trong

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

    setFeedbackText("");
    setFeedbackA(null);
  };
  return (
    <div className="space-y-4">
      {/* Nội dung chính */}
      {!ap ? (
        <Empty icon={Users} title="Chưa có bệnh nhân nào" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Tests */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Kết quả bài test gần nhất
              </h3>
              <Badge tone="info">PHQ-9 • GAD-7</Badge>
            </div>
            <div className="space-y-3">
              <div>
                <Progress
                  value={ap.testHistory.at(-2).totalScore ?? 0}
                  max={21}
                  label="PHQ-9"
                />
                <div
                  className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                    classifyPHQ9(ap.testHistory.at(-2).totalScore ?? 0).tone
                  )}`}
                >
                  {classifyPHQ9(ap.testHistory.at(-2).totalScore ?? 0).label}
                </div>
              </div>
              <div>
                <Progress
                  value={ap.testHistory.at(-1).totalScore ?? 0}
                  max={21}
                  label="GAD-7"
                />
                <div
                  className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                    classifyGAD7(ap.testHistory.at(-1).totalScore ?? 0).tone
                  )}`}
                >
                  {classifyGAD7(ap.testHistory.at(-1).totalScore ?? 0).label}
                </div>
              </div>
            </div>
          </div>

          {/* Assignments — giống trang Homework */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bài tập trị liệu</h3>

              <div className="gap-2 flex">
                {ap.retest === false && (
                  <IconBtn
                    icon={RefreshCcwDotIcon}
                    onClick={async () => {
                      const ok = window.confirm(
                        "Bạn có chắc chắn muốn yêu cầu bệnh nhân này làm lại bài test không?"
                      );

                      if (!ok) return;
                      try {
                        const res = await axiosInstance.patch(
                          API_PATHS.USERS.UPDATE_RETEST(activePatientId)
                        );
                        console.log(res.data);
                        toast.success(res.data.message);
                        setPatients((prev) =>
                          prev.map((p) =>
                            p._id === activePatientId
                              ? {
                                  ...p,
                                  retest: true, // đánh dấu cần làm lại test
                                }
                              : p
                          )
                        );
                      } catch (e) {
                        toast.error(e.response.data.message);
                      }
                    }}
                  >
                    Yêu cầu làm bài test
                  </IconBtn>
                )}
                <IconBtn
                  icon={NotebookPen}
                  onClick={() => {
                    setNav("homework");
                  }}
                >
                  Giao bài tập
                </IconBtn>
                <IconBtn icon={PhoneCall} onClick={() => setNav("calendar")}>
                  Lên lịch gọi
                </IconBtn>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(ass || []).length === 0 ? (
                <Empty
                  icon={ClipboardList}
                  title="Chưa có bài tập"
                  hint="Giao bài từ danh sách mẫu"
                />
              ) : (
                (ass || []).map((a) => {
                  const isSubmitted = a.status === "completed";
                  return (
                    <div
                      key={a._id}
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
                        </div>
                      </div>

                      <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                        <IconBtn
                          icon={FileText}
                          onClick={() => setNav("homework")}
                        >
                          Chi tiết
                        </IconBtn>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes */}
          <TestHistoryChart history={ap.testHistory || []} />
          <div className="md:col-span-1 rounded-2xl border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ghi chú</h3>
              <Badge tone="default">
                Phiên gần nhất:{" "}
                {ap.notes?.[0]?.createdAt
                  ? prettyTime(ap.notes?.[0]?.createdAt)
                  : "—"}
              </Badge>
            </div>
            <div className="relative ">
              <textarea
                className="h-28 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                // defaultValue={""}
                onBlur={(e) => setNote(e.target.value)}
              ></textarea>
              <button
                onClick={async () => {
                  await axiosInstance.post(API_PATHS.USERS.ADD_NOTE, {
                    userId: ap._id,
                    content: note,
                  });
                  setNote("");
                  setNotes((prev) => [
                    {
                      content: note,
                      createdAt: Date.now(),
                    },
                    ...prev,
                  ]);
                }}
                className="absolute right-1 bottom-3 border-gray-500 border-2 rounded-xl px-2 py-1 hover:bg-gray-300 bg-gray-200 cursor-pointer"
              >
                Cập nhật
              </button>
            </div>{" "}
            <div className="space-y-2 overflow-y-scroll max-h-[210px] border-gray-500 border-1 rounded">
              {notes.map((n, idx) => {
                const key = n?._id || `${n?.createdAt}-${idx}`;
                return (
                  <div
                    key={key}
                    className="m-2 rounded-xl border border-zinc-200 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-zinc-500">
                        {prettyTime(n?.createdAt)}
                      </div>
                    </div>

                    <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                      {n?.content || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
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
function TestHistoryChart({ history = [] }) {
  // Tách lịch sử PHQ-9 & GAD-7
  const phq = (history || [])
    .filter((t) => t?.code === "PHQ-9")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const gad = (history || [])
    .filter((t) => t?.code === "GAD-7")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  console.log(phq, gad);
  if (!phq.length && !gad.length) {
    return (
      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500">
        Chưa có lịch sử bài test để vẽ biểu đồ.
      </div>
    );
  }

  const width = 280;
  const height = 140;
  const padX = 24;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const buildPath = (points, maxScore) => {
    if (!points.length) return "";
    return points
      .map((p, idx) => {
        const x =
          padX +
          (points.length === 1
            ? innerW / 2
            : (innerW * idx) / (points.length - 1));
        const y =
          padY +
          innerH -
          Math.max(0, Math.min(1, p.totalScore / maxScore)) * innerH;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const phqPath = buildPath(phq, 21);
  const gadPath = buildPath(gad, 21);

  const buildDots = (points, maxScore) =>
    points.map((p, idx) => {
      const x =
        padX +
        (points.length === 1
          ? innerW / 2
          : (innerW * idx) / (points.length - 1));
      const y =
        padY +
        innerH -
        Math.max(0, Math.min(1, p.totalScore / maxScore)) * innerH;
      return { x, y, score: p.totalScore };
    });

  const phqDots = buildDots(phq, 21);
  const gadDots = buildDots(gad, 21);

  return (
    <div className="md:col-span-1 rounded-2xl border bg-white p-4">
      <div className="mt-2 mb-2 flex items-center justify-between text-xs text-zinc-600">
        <span>Diễn biến mức độ theo thời gian</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-emerald-500" />
            <span>PHQ-9</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-sky-500" />
            <span>GAD-7</span>
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Trục X & Y nhẹ nhàng */}
        <line
          x1={padX}
          y1={padY + innerH}
          x2={padX + innerW}
          y2={padY + innerH}
          className="stroke-zinc-200"
          strokeWidth="1"
        />
        <line
          x1={padX}
          y1={padY}
          x2={padX}
          y2={padY + innerH}
          className="stroke-zinc-200"
          strokeWidth="1"
        />

        {/* Đường PHQ-9 */}
        {phqPath && (
          <path
            d={phqPath}
            fill="none"
            stroke="#059669" // emerald-500
            strokeWidth="2"
          />
        )}

        {/* Đường GAD-7 */}
        {gadPath && (
          <path
            d={gadPath}
            fill="none"
            stroke="#0ea5e9" // sky-500
            strokeWidth="2"
          />
        )}

        {/* Dots PHQ */}
        {phqDots.map((d, idx) => (
          <g key={`phq-dot-${idx}`}>
            <circle cx={d.x} cy={d.y} r={3} fill="#059669" />
          </g>
        ))}

        {/* Dots GAD */}
        {gadDots.map((d, idx) => (
          <g key={`gad-dot-${idx}`}>
            <circle cx={d.x} cy={d.y} r={3} fill="#0ea5e9" />
          </g>
        ))}
      </svg>
      {/* Nhãn nhỏ phía dưới: số lần test */}
      <div className="mt-1 text-[11px] text-zinc-500">
        Lần test PHQ-9: {phq.length} • Lần test GAD-7: {gad.length}
      </div>
    </div>
  );
}

function MessagesView({
  patients,
  rooms,
  activeId,
  onDoctorComplete, // optional
  onRespondComplete, // optional
  onlineUsers,
}) {
  const [activePatientId, setActivePatientId] = useState(
    activeId || patients[0]?._id || null
  );
  const {
    messages,
    fetchMessages,
    sendMessage,
    subcribeToMessages,
    unSubcribeToMessages,
    setMessages,
  } = useUserContext();
  const [text, setText] = useState("");
  const [room, setRoom] = useState([]);
  const ap =
    patients.find((p) => p._id === activePatientId) || patients[0] || null;
  const msgs = messages || [];
  const listRef = useRef(null);
  // Mark read khi mở hội thoại
  useEffect(() => {
    const r = rooms.find((r) => r.userId === ap._id);
    if (!r) return;
    setRoom(r);
    fetchMessages(r._id);
  }, [ap?._id, rooms, fetchMessages]);
  useEffect(() => {
    if (!room?._id) return;
    subcribeToMessages(room._id);
    return () => unSubcribeToMessages();
  }, [room?._id, subcribeToMessages, unSubcribeToMessages]);
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
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

    // setPatients((ps) =>
    //   ps.map((p) => {
    //     if (p._id !== ap.id) return p;
    //     const sysMsg = {
    //       id: Math.random().toString(36).slice(2),
    //       sender: "system",
    //       text: "Bác sĩ đã đánh dấu HOÀN THÀNH khóa điều trị. Cảm ơn bạn đã trao đổi!",
    //       at: new Date().toISOString(),
    //     };
    //     return {
    //       ...p,
    //       chatStatus: "completed",
    //       // Nếu trước đó có pending từ user thì kết thúc luôn yêu cầu
    //       completeRequest: p.completeRequest
    //         ? { ...p.completeRequest, status: "accepted" }
    //         : {
    //             from: "doctor",
    //             status: "accepted",
    //             at: new Date().toISOString(),
    //           },
    //       messages: [...(p.messages || []), sysMsg],
    //     };
    //   })
    // );

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

    // setPatients((ps) =>
    //   ps.map((p) => {
    //     if (p._id !== ap.id) return p;

    //     const accepted = decision === "accept";
    //     const sysMsg = {
    //       id: Math.random().toString(36).slice(2),
    //       sender: "system",
    //       text: accepted
    //         ? "Yêu cầu hoàn thành từ người dùng đã được CHẤP NHẬN. Phiên chat kết thúc."
    //         : "Yêu cầu hoàn thành từ người dùng đã bị TỪ CHỐI. Bạn có thể tiếp tục trao đổi.",
    //       at: new Date().toISOString(),
    //     };

    //     return {
    //       ...p,
    //       chatStatus: accepted ? "completed" : p.chatStatus || "active",
    //       completeRequest: {
    //         ...(p.completeRequest || { from: "user" }),
    //         status: accepted ? "accepted" : "rejected",
    //         at: new Date().toISOString(),
    //       },
    //       messages: [...(p.messages || []), sysMsg],
    //     };
    //   })
    // );

    onRespondComplete?.({ patientId: ap.id, decision });
  };

  return patients.length > 0 ? (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sidebar: danh sách cuộc hội thoại */}
        <div>
          <div className="mb-2 text-sm font-semibold">Cuộc hội thoại</div>
          <div className="space-y-2">
            {patients.map((p) => (
              <button
                key={p._id}
                onClick={() => setActivePatientId(p._id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50 ${
                  ap?._id === p._id ? "border-zinc-900" : "border-zinc-200"
                }`}
              >
                <div className="relative">
                  <Avatar name={p.accountId.fullName} />
                  {onlineUsers.onlineUsers.includes(p._id) && (
                    <span className="absolute bottom-0.5 size-2 rounded-full ring-2 ring-zinc-900 bg-green-500 right-0.5"></span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {p.accountId.fullName}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {rooms.find((r) => r.userId === p._id).lastMessage || "—"}
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
            <Avatar name={ap.accountId.fullName} />
            <div className="text-sm font-semibold">{ap.accountId.fullName}</div>
            {isCompleted ? (
              <Badge tone="default">Đã hoàn thành</Badge>
            ) : onlineUsers.onlineUsers.includes(ap._id) ? (
              <Badge tone="success">Online</Badge>
            ) : (
              <Badge tone="danger">Offline</Badge>
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
                Người dùng đã gửi <b>yêu cầu hoàn thành</b> phiên trò chuyện
                này.
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
          <div ref={listRef} className="h-[50vh] overflow-auto p-4">
            {msgs.length === 0 ? (
              <Empty icon={MessageSquareText} title="Chưa có tin nhắn" />
            ) : (
              <div className="space-y-2">
                {msgs.map((m) => {
                  if (m.senderType === "system") {
                    return (
                      <div
                        key={m._id}
                        className="mx-auto max-w-[80%] text-center text-xs text-zinc-600"
                      >
                        <div className="inline-block rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
                          {m.content}
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-400">
                          {prettyTime(m.createdAt)}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={m._id}
                      className={`flex ${
                        m.senderType === "doctor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          m.senderType === "doctor"
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100"
                        }`}
                      >
                        <div>{m.content}</div>
                        <div className="mt-1 text-[10px] opacity-70">
                          {prettyTime(m.createdAt)}
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
            onSubmit={async (e) => {
              e.preventDefault();
              if (!ap || !text.trim()) return;
              await sendMessage({ roomId: room._id, content: text });

              setText("");
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isCompleted ? "Phiên đã hoàn thành" : "Nhập tin nhắn…"
              }
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
    </>
  ) : (
    <div className="space-y-4">
      <Empty icon={Users} title="Chưa có bệnh nhân nào" />
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
    const cs = new Date(c.startTime).getTime();
    return cs >= sMs && cs < eMs && c.status !== "cancelled";
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
  rooms,
  onCreateCall, // (payload) => void
  setOpenCall,
  setOpenCallDetails,
  sessions,
  setCallRoomId,
  setSessionData,
}) {
  // NEW: tuần đang hiển thị (mặc định tuần hiện tại)
  const [weekRef, setWeekRef] = React.useState(new Date());
  const week = buildWeekNoSunday(weekRef); // T2..T7
  const hours = Array.from({ length: 23 }, (_, i) => 0 + i); // 08:00 - 19:00
  // Lưu tạm lịch mới tạo để hiển thị ngay
  const [internalCalls, setInternalCalls] = React.useState([]);
  const [cancelledIds, setCancelledIds] = React.useState(() => new Set());

  const allCalls = React.useMemo(() => {
    const merged = [...(calls || []), ...internalCalls];
    return merged.filter((c) => {
      const id = c._id?.toString();
      if (id && cancelledIds.has(id)) return false;
      return c.status !== "cancelled" && c.status !== "cancelled";
    });
  }, [calls, internalCalls, cancelledIds]);
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
        p.accountId?.fullName.toLowerCase().includes(q) ||
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

  const confirmCreate = async () => {
    if (!pickedPatientId) {
      alert("Vui lòng chọn bệnh nhân ");
      return;
    }
    if (!startDT || !endDT) return;
    if (isSunday(startDT)) {
      alert("Chủ nhật không làm việc. Vui lòng chọn ngày T2–T7.");
      return;
    }
    const room = rooms.find((e) => e.userId === pickedPatientId);
    const payload = {
      roomId: room._id,
      startTime: startDT,
      endTime: endDT,
      status: "pending",
    };
    // // 1) Hiển thị ngay

    // // 2) Chuyển view sang tuần chứa ngày vừa đặt (để chắc chắn thấy slot)

    // // 3) Gọi parent/backend nếu có
    // if (typeof onCreateCall === "function") {
    const { check, appointment } = await onCreateCall(payload);
    if (check === true) {
      const _id = appointment._id;
      const payloadUI = {
        _id,
        roomId: room,
        startTime: startDT,
        endTime: endDT,
        status: "pending",
      };
      setInternalCalls((prev) => [payloadUI, ...prev]);
      setWeekRef(startDT);
      setOpen(false);
    }
    // }
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
              setOpenCall={setOpenCall}
              setOpenCallDetails={setOpenCallDetails}
              sessions={sessions}
              setCallRoomId={setCallRoomId}
              setSessionData={setSessionData}
              setInternalCalls={setInternalCalls}
              setCancelledIds={setCancelledIds}
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
              // disabled={!pickedPatientId || !pickDate || !pickTime}
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
                    key={p._id}
                    onClick={() => setPickedPatientId(p._id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                      pickedPatientId === p._id ? "bg-zinc-200" : ""
                    }`}
                  >
                    <Avatar name={p.accountId?.fullName} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.accountId.fullName}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {p.accountId.gender} •{" "}
                        {formatAge(p.accountId.birthDate)}t •{" "}
                        {p.dominantSymptom}
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
                Chủ nhật không làm việc. Vui lòng chọn T2–T7.
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
              Giờ kết thúc : <span className="font-medium">{endLabel}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Ô lịch: hiển thị mọi cuộc hẹn bắt đầu trong giờ
function CalendarCell({
  date,
  hour,
  calls,
  patients,
  setOpenCall,
  setInternalCalls,
  setOpenCallDetails,
  setSessionData,
  sessions,
  setCallRoomId,
  setCancelledIds,
}) {
  const callsInHour = findCallsInHour(calls, date, hour);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    call: null,
    reason: "",
  });

  if (callsInHour.length > 0) {
    const now = new Date();
    const nowMs = now.getTime();
    const fifteenMs = 15 * 60 * 1000;

    return (
      <div className="p-2 text-xs space-y-2">
        {callsInHour.map((call) => {
          const p = patients.find(
            (x) => x._id === call.roomId?.userId?._id
          ) || {
            accountId: { fullName: "Bệnh nhân" },
          };

          const start = new Date(call.startTime);
          const end = new Date(call.endTime);
          const startMs = start.getTime();
          const endMs = end.getTime();
          const status = call.status;

          const session =
            sessions.find(
              (e) => e?.appointmentId?.toString() === call?._id?.toString()
            ) || null;
          console.log(sessions);
          const isCompleted =
            (status === "completed" || status === "complete") && session;
          const isPast = nowMs > endMs;
          const isSoon = nowMs < startMs - fifteenMs; // dùng cho label "Sắp diễn ra"

          const oneDayMs = 24 * 60 * 60 * 1000;
          const diffMs = startMs - nowMs;
          const canCancel = diffMs > oneDayMs; // ✅ chỉ cho phép hủy nếu còn hơn 1 ngày

          let canJoin = false;
          let btnLabel = "";

          // Xác định nhãn nút chính
          if (isSoon) {
            btnLabel = "Sắp diễn ra";
            canJoin = false;
          } else if (nowMs >= startMs - fifteenMs && nowMs <= endMs) {
            btnLabel = "Vào phòng";
            canJoin = true;
          } else if (isCompleted) {
            btnLabel = "Xem chi tiết";
            canJoin = true;
          } else {
            btnLabel = "Đã quá giờ";
            canJoin = false;
          }

          // Tone màu card
          let cardTone = "border-blue-200 bg-blue-50 text-blue-900"; // Sắp diễn ra (default)

          if (canJoin && nowMs <= endMs) {
            // Vào phòng
            cardTone = "border-emerald-300 bg-emerald-50 text-emerald-900";
          } else if (isCompleted) {
            // Xem chi tiết
            cardTone = "border-zinc-200 bg-zinc-50 text-zinc-800";
          } else if (isPast && !isCompleted) {
            // Đã quá giờ
            cardTone = "border-rose-300 bg-rose-50 text-rose-900";
          }

          return (
            <div
              key={call._id || call.startTime}
              className={`flex flex-col gap-2 relative rounded-xl border p-2 shadow-sm max-w-[130px] ${cardTone}`}
            >
              {/* Hàng 1: Tên + giờ */}
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="text-[12px] font-semibold text-zinc-800 truncate max-w-[100px]">
                  {p.accountId.fullName}
                </div>

                <div className="text-[11px] text-zinc-600">
                  {fmtTime(call.startTime)} – {fmtTime(call.endTime)}
                </div>
              </div>

              {/* Hàng 2: Nút hành động + Hủy */}
              <div className="flex items-center justify-center gap-2">
                {/* Nút chính */}
                <IconBtn
                  icon={
                    btnLabel === "Vào phòng"
                      ? Video
                      : btnLabel === "Sắp diễn ra"
                      ? Clock
                      : btnLabel === "Xem chi tiết"
                      ? FileText
                      : AlertCircleIcon
                  }
                  className={`border text-[11px] px-3 py-1.5 
                ${
                  btnLabel === "Vào phòng"
                    ? "border-emerald-400! text-emerald-700 bg-white hover:bg-emerald-700! hover:text-white"
                    : btnLabel === "Xem chi tiết"
                    ? "border-zinc-400! text-zinc-700 bg-white hover:bg-zinc-500 hover:text-white"
                    : btnLabel === "Đã quá giờ"
                    ? "border-rose-400! text-rose-600 bg-rose-50 cursor-not-allowed"
                    : "border-blue-400! text-blue-700 bg-blue-50 cursor-not-allowed"
                }
              `}
                  disabled={!canJoin && !isCompleted}
                  onClick={() => {
                    if (btnLabel === "Xem chi tiết" && isCompleted) {
                      setSessionData(session);
                      setOpenCallDetails(true);
                    }
                    if (canJoin && btnLabel === "Vào phòng" && !isCompleted) {
                      setOpenCall(true);
                      setCallRoomId(call._id);
                    }
                  }}
                >
                  {btnLabel}
                </IconBtn>
              </div>
              {isSoon && (
                <XIcon
                  className={`rounded-full border p-1 text-[11px] transition absolute -right-2 -top-2
      ${
        canCancel
          ? "border-rose-300! text-rose-600 hover:bg-rose-500 hover:text-white hover:cursor-pointer"
          : "border-zinc-400! text-zinc-600 cursor-not-allowed"
      }
    `}
                  onClick={() => {
                    if (!canCancel) {
                      alert("Bạn chỉ được hủy cuộc hẹn trước ít nhất 1 ngày.");
                      return;
                    }

                    setCancelModal({
                      open: true,
                      call,
                      reason: "",
                    });
                  }}
                />
              )}
            </div>
          );
        })}
        {cancelModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-1">
                Hủy cuộc hẹn với bệnh nhân{" "}
                {cancelModal.call.roomId.userId?.accountId?.fullName ||
                  patients.find(
                    (e) =>
                      e._id ===
                      (cancelModal.call.roomId?.userId?._id ||
                        cancelModal.call?.roomId?.userId)
                  ).accountId?.fullName ||
                  "benh nhan"}
              </h3>

              <label className="text-sm text-slate-600">
                Vui lòng nhập lý do tại sao lại muốn hủy{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border rounded-lg p-2 mt-1.5 text-sm"
                placeholder="Nhập lý do..."
                value={cancelModal.reason}
                onChange={(e) =>
                  setCancelModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                  onClick={() =>
                    setCancelModal({ open: false, call: null, reason: "" })
                  }
                >
                  Đóng
                </button>

                <button
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  onClick={async () => {
                    if (!cancelModal.reason.trim()) {
                      toast.error("Lý do hủy không được để trống.");
                      return;
                    }

                    try {
                      const res = await axiosInstance.patch(
                        API_PATHS.APPOINTMENTS.UPDATE_APPOINTMENTS_BY_ID(
                          cancelModal.call._id
                        ),
                        {
                          status: "cancelled",
                          reason: cancelModal.reason,
                        }
                      );

                      toast.success("Đã hủy cuộc hẹn thành công");
                      setCancelledIds((prev) => {
                        const next = new Set(prev);
                        next.add(cancelModal.call._id.toString());
                        return next;
                      });
                      setInternalCalls((prev) =>
                        prev.filter((c) => c._id !== cancelModal.call._id)
                      );
                      setCancelModal({ open: false, call: null, reason: "" });
                    } catch (err) {
                      toast.error(err.message);
                    }
                  }}
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-16 p-2 text-[11px] text-zinc-300 flex justify-center">
      —
    </div>
  );
}

// ---------------------------- Homework --------------------------------
function HomeworkView({
  assignments, // mảng HomeworkAssignment từ backend
  homeworkSubmissions,
  patients, // mảng bệnh nhân để map userId -> tên
  activePatientId = patients[0]?._id, // id bệnh nhân đang chọn
  onAssignOpen,
  onUpdate, // optional: async (id, payload) => ...
  setAssignments,
  setHomeworkSubmissions,
}) {
  const [q, setQ] = useState("");

  // Bệnh nhân đang chọn
  const ap = useMemo(() => {
    return (
      patients.find((p) => String(p._id) === String(activePatientId)) ||
      patients[0]
    );
  }, [patients, activePatientId]);

  // Danh sách bài tập của bệnh nhân đang chọn
  const ass = useMemo(() => {
    return (assignments || [])
      .filter((a) => String(a.userId) === String(activePatientId))
      .reverse();
  }, [assignments, activePatientId]);

  // Filter theo title
  const filtered = useMemo(
    () =>
      (ass || []).filter((a) => {
        const title = (a.title || "").toLowerCase();
        const query = q.toLowerCase();
        return title.includes(query);
      }),
    [ass, q]
  );

  // -------- ENUM & helper --------
  const isSubmitted = (a) => a.status === "completed";

  const statusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Đã nộp";
      case "overdue":
        return "Đã quá hạn";
      case "assigned":
      default:
        return "Chưa nộp";
    }
  };

  const statusTone = (status) => {
    switch (status) {
      case "completed":
        return "success"; // màu xanh
      case "overdue":
        return "danger"; // màu đỏ
      case "assigned":
      default:
        return "warn"; // màu vàng/cam
    }
  };

  const methodLabel = (m) => m || "Không rõ";

  // --------- STATE cho popup xem & sửa ---------
  const [viewA, setViewA] = useState(null); // bài đang xem chi tiết
  const [editA, setEditA] = useState(null); // bài đang chỉnh sửa
  const [submissionFeedback, setSubmissionFeedback] = useState({});

  const submissionsOfA = useMemo(() => {
    if (!viewA) return [];
    return (homeworkSubmissions || []).filter(
      (s) => String(s.assignmentId) === String(viewA._id)
    );
  }, [homeworkSubmissions, viewA]);

  const [editTitle, setEditTitle] = useState("");
  const [editMethod, setEditMethod] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState("");
  const [editContent, setEditContent] = useState("");

  const toLocalInputValue = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  // Mở popup xem
  const handleView = (a) => {
    setViewA(a);
    const fb = {};
    (homeworkSubmissions || [])
      .filter((s) => String(s.assignmentId) === String(a._id))
      .forEach((s) => {
        fb[s._id] = s.feedbackDoctor || "";
      });

    setSubmissionFeedback(fb);
  };
  const handleSaveSubmissionFeedback = async (submissionId) => {
    const content = (submissionFeedback[submissionId] || "").trim();

    try {
      await axiosInstance.patch(
        API_PATHS.HOMEWORK_SUBMISSIONS.UPDATE_FEEDBACK_BY_ID(submissionId),
        { feedbackDoctor: content }
      );

      setHomeworkSubmissions((prev) =>
        prev.map((s) =>
          s._id === submissionId
            ? { ...s, feedbackDoctor: content } // cập nhật đúng submission đó
            : s
        )
      );
      setViewA(null);
      toast.success("Đã lưu phản hồi cho bài nộp.");
    } catch (error) {
      console.error(error);
      toast.error("Lưu phản hồi thất bại, vui lòng thử lại.");
    }
  };

  // Mở popup chỉnh sửa
  const openEdit = (a) => {
    setEditA(a);
    setEditTitle(a.title || "");
    setEditMethod(a.method || "");
    setEditDifficulty(a.difficulty || "medium");
    setEditDueDate(toLocalInputValue(a.dueDate));
    setEditEstimatedMinutes(a.estimatedMinutes || "");
    setEditContent(a.content || "");
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editA) return;

    const payload = {
      title: editTitle.trim(),
      method: editMethod.trim(),
      difficulty: editDifficulty,
      content: editContent.trim(),
      estimatedMinutes: editEstimatedMinutes
        ? Number(editEstimatedMinutes)
        : undefined,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    };

    // validate đơn giản
    if (!payload.title) {
      alert("Tiêu đề không được để trống");
      return;
    }

    try {
      if (typeof onUpdate === "function") {
        await onUpdate(editA._id, payload);
      } else {
        console.log("Update assignment payload >>>", editA._id, payload);
      }
      setEditA(null);
    } catch (error) {
      console.error(error);
      alert("Cập nhật bài tập thất bại, vui lòng thử lại.");
    }
  };

  // Nếu chưa có bệnh nhân
  if (!ap) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Bài tập trị liệu</div>
          <IconBtn icon={Plus} onClick={onAssignOpen}>
            Giao bài mới
          </IconBtn>
        </div>
        <Empty
          icon={ClipboardList}
          title="Chưa có bệnh nhân"
          hint="Khi có bệnh nhân được gán, bạn sẽ thấy danh sách bài tập ở đây."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: info bệnh nhân + search + Giao bài */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search + Giao bài + tổng số */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm bài tập theo tiêu đề"
              className="h-10 w-64 max-w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <IconBtn icon={Plus} onClick={onAssignOpen}>
            Giao bài mới
          </IconBtn>
        </div>
        <div className="text-sm text-zinc-500">
          Tổng: <span className="font-semibold">{filtered.length}</span> bài
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="grid grid-cols-1">
          <Empty
            icon={ClipboardList}
            title="Chưa có bài tập"
            hint="Hãy giao bài tập đầu tiên cho bệnh nhân này."
          />
        </div>
      )}

      {/* Danh sách bài tập */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((a) => {
          const submitted = isSubmitted(a);

          // màu cạnh trái theo status
          const borderStripe =
            a.status === "completed"
              ? "border-l-4 border-l-emerald-500" // đã nộp
              : a.status === "overdue"
              ? "border-l-4 border-l-rose-500" // đã quá hạn
              : "border-l-4 border-l-amber-400"; // chưa nộp

          const attachmentsCount = (a.attachments || []).length;

          return (
            <div
              key={a._id}
              className={`group relative flex flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${borderStripe}`}
            >
              {/* Row 1: tiêu đề + status */}
              <div className="flex items-start justify-around gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-semibold">
                      {a.title}
                    </div>
                    <div className="flex gap-2">
                      {a.aiSuggested && <Badge tone="info">AI gợi ý</Badge>}
                      <Badge tone={statusTone(a.status)}>
                        {statusLabel(a.status)}
                      </Badge>
                      {/* Actions */}
                      {submitted ? (
                        <IconBtn
                          icon={Eye}
                          onClick={() => handleView(a)}
                          title="Xem chi tiết"
                          className="border-zinc-200 hover:border-zinc-300"
                        >
                          Xem chi tiết
                        </IconBtn>
                      ) : (
                        <IconBtn
                          icon={PencilLine}
                          onClick={() => openEdit(a)}
                          title="Chỉnh sửa"
                          className="border-zinc-200 hover:border-zinc-300 py-1.5! px-2.5!"
                        >
                          Chỉnh sửa
                        </IconBtn>
                      )}
                    </div>
                  </div>

                  {/* Meta: method, khó, tần suất, thời lượng */}
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      Phương pháp:{" "}
                      <span className="font-medium">
                        {methodLabel(a.method)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      Độ khó:{" "}
                      <span className="font-medium">
                        {convertDifficult(a.difficulty)}
                      </span>
                    </span>

                    {a.estimatedMinutes && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-0.5">
                        <Clock3 className="h-3 w-3" />~{a.estimatedMinutes} phút
                      </span>
                    )}
                  </div>
                  <hr className="text-gray-200 my-2"></hr>

                  {/* Hạn + attachments */}
                  <div className="mt-1 ml-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span>
                      Hạn:{" "}
                      <span className="font-medium">
                        {a.dueDate ? fmtDateTime(a.dueDate) : "Không đặt hạn"}
                      </span>
                    </span>
                    {attachmentsCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {attachmentsCount} tệp đính kèm
                      </span>
                    )}
                  </div>

                  <hr className="text-gray-200 my-2"></hr>
                  {/* Nội dung rút gọn */}
                  {a.content && (
                    <div className="mt-2 text-xs text-zinc-600 line-clamp-2">
                      {a.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------- POPUP XEM CHI TIẾT -------- */}
      {viewA && (
        <Modal
          open={!!viewA}
          title={`Chi tiết bài tập: ${viewA.title}`}
          onClose={() => setViewA(null)}
          footer={
            <div className="flex justify-end">
              <IconBtn onClick={() => setViewA(null)}>Đóng</IconBtn>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            {/* Thông tin bài tập */}
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-zinc-500">Phương pháp</div>
                  <div className="font-medium">{methodLabel(viewA.method)}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Độ khó</div>
                  <div className="font-medium">
                    {convertDifficult(viewA.difficulty)}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500">Thời lượng ước tính</div>
                  <div className="font-medium">
                    {viewA.estimatedMinutes
                      ? `${viewA.estimatedMinutes} phút`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Hạn</div>
                  <div className="font-medium">
                    {viewA.dueDate
                      ? fmtDateTime(viewA.dueDate)
                      : "Không đặt hạn"}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Trạng thái</div>
                  <div className="font-medium">{statusLabel(viewA.status)}</div>
                </div>
              </div>

              {viewA.content && (
                <div>
                  <div className="text-zinc-500 mb-1">Hướng dẫn / Nội dung</div>
                  <div className="whitespace-pre-wrap rounded-xl border bg-zinc-50 p-3 text-sm">
                    {viewA.content}
                  </div>
                </div>
              )}

              {!!(viewA.attachments || []).length && (
                <div>
                  <div className="text-zinc-500 mb-1 flex items-center gap-1">
                    <Paperclip className="h-4 w-4" /> Tệp đính kèm
                  </div>
                  <ul className="list-disc pl-5 text-sm">
                    {viewA.attachments.map((url, i) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline break-all"
                        >
                          {url.split("/").at(-1)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bài nộp của bệnh nhân + feedback bác sĩ theo từng submission */}
            {submissionsOfA.length > 0 ? (
              <div className="space-y-3">
                <div className="text-zinc-500 font-medium">
                  Bài nộp của bệnh nhân
                </div>

                {submissionsOfA.map((sub, idx) => {
                  const attach = sub.attachments || sub.attachmentUrls || [];

                  return (
                    <div
                      key={sub._id || idx}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-3"
                    >
                      <div className="flex items-center justify-center text-xs text-zinc-500">
                        {sub.createdAt && (
                          <span>Nộp lúc: {fmtDateTime(sub.createdAt)}</span>
                        )}
                      </div>
                      <hr className="text-gray-600" />
                      {/* Cảm xúc */}
                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        <div>
                          <div className="text-zinc-500">
                            Cảm xúc trước khi làm
                          </div>
                          <div className="font-medium">
                            {sub.moodBefore || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-zinc-500">
                            Cảm xúc sau khi làm
                          </div>
                          <div className="font-medium">
                            {sub.moodAfter || "—"}
                          </div>
                        </div>
                      </div>

                      {/* Câu trả lời */}
                      {sub.answers && (
                        <div>
                          <div className="text-zinc-500 mb-1">
                            Câu trả lời / Ghi chú
                          </div>
                          <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-2 text-xs">
                            {typeof sub.answers === "string"
                              ? sub.answers
                              : JSON.stringify(sub.answers, null, 2)}
                          </div>
                        </div>
                      )}

                      {/* Attachment */}
                      {attach.length > 0 && (
                        <div>
                          <div className="text-zinc-500 mb-1 flex items-center gap-1">
                            <Paperclip className="h-3 w-3" /> Tệp đính kèm khi
                            nộp
                          </div>
                          <ul className="list-disc pl-5 text-xs">
                            {attach.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline break-all"
                                >
                                  {url.split("/").at(-1)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Phản hồi của bác sĩ cho bài nộp này */}
                      <div className="space-y-1 pt-2 border-t border-zinc-300">
                        <div className="text-xs text-zinc-500">
                          Phản hồi của bác sĩ
                        </div>
                        <textarea
                          rows={2}
                          value={submissionFeedback[sub._id] || ""}
                          onChange={(e) =>
                            setSubmissionFeedback((prev) => ({
                              ...prev,
                              [sub._id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-200 p-2 text-xs outline-none focus:border-zinc-400"
                          placeholder="Nhập phản hồi cho bài nộp này..."
                        />
                        {submissionFeedback[sub._id].trim().length > 0 &&
                          submissionFeedback[sub._id] !==
                            sub.feedbackDoctor && (
                            <div className="flex justify-end">
                              <IconBtn
                                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700!"
                                onClick={() =>
                                  handleSaveSubmissionFeedback(sub._id)
                                }
                              >
                                Lưu phản hồi
                              </IconBtn>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                Bài tập này hiện chưa có bài nộp nào từ bệnh nhân.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* -------- POPUP CHỈNH SỬA -------- */}
      {editA && (
        <Modal
          open={!!editA}
          title={`Chỉnh sửa bài: ${editA.title}`}
          onClose={() => setEditA(null)}
          footer={
            <div className="flex items-center justify-end gap-2">
              <IconBtn onClick={() => setEditA(null)}>Hủy</IconBtn>
              <IconBtn
                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleSaveEdit}
              >
                Lưu thay đổi
              </IconBtn>
            </div>
          }
        >
          <div className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phương pháp
                </label>
                <input
                  type="text"
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                  placeholder="VD: CBT, ACT, Mindfulness..."
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Độ khó</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Thời lượng ước tính (phút)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editEstimatedMinutes}
                  onChange={(e) => setEditEstimatedMinutes(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Hạn</label>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Hướng dẫn / Nội dung
              </label>
              <textarea
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                placeholder="Mô tả cụ thể bài tập để bệnh nhân dễ làm theo…"
              />
            </div>

            <p className="text-xs text-zinc-500">
              *Nếu muốn chỉnh sửa file đính kèm, xử lý ở flow upload khác
              (frontend hoặc màn riêng).
            </p>
          </div>
        </Modal>
      )}
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
            key={n._id}
            className={`flex items-center gap-3 rounded-2xl border p-3 w-full ${
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
            <div className="min-w-0 flex w-full justify-between">
              <div>
                <div className="truncate text-sm">
                  {n.title} {!n.read && <Badge tone="info">Mới</Badge>}
                </div>
                <div className="truncate text-sm">{n.message}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 ">
                  {prettyTime(n.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- Settings -------------------------------
function SettingsView({ doctor, onSave, onCancel }) {
  const init = { ...(doctor || {}) };

  // ---------- State ----------
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(init.avatar || "");
  const [fullName, setFullName] = useState(init.accountId.fullName || "");
  const [role, setRole] = useState(init.role || "counselor");
  const [gender, setGender] = useState(init.accountId.gender || "other");
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
                  <option value="counselor">Counselor</option>
                  <option value="therapist">Therapist</option>
                  <option value="psychiatrist">Psychiatrist</option>
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
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
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
                  {/* {existingCerts.map((c) => ( */}
                  <ul className="space-y-1 text-sm">
                    {existingCerts.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5"
                      >
                        <span className="truncate">{f}</span>
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
                  {/* ))} */}
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
  console.log(listOrPatients);
  return arr.find((p) => p._id === id)?.accountId.fullName || id;
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
