// src/AdminPortal.jsx
import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileStack,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  ShieldCheck,
  BadgePercent,
  Check,
  X,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";

/* --------------------------- Tiny UI primitives --------------------------- */
function IconBtn({ children, icon: Icon, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 ${className}`}
      {...rest}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function Badge({ children, tone = "default", className = "" }) {
  const tones = {
    default: "border-zinc-200 text-zinc-700",
    info: "border-sky-200 text-sky-700 bg-sky-50",
    warn: "border-amber-200 text-amber-700 bg-amber-50",
    success: "border-emerald-200 text-emerald-700 bg-emerald-50",
    danger: "border-rose-200 text-rose-700 bg-rose-50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl border bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

function Avatar({ name = "U", size = 36 }) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const cls = `grid place-items-center rounded-xl bg-zinc-900 text-white`;
  return (
    <div
      className={cls}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}
    >
      {initials}
    </div>
  );
}

/* ------------------------------ Tiny helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const addDaysISO = (days) =>
  new Date(Date.now() + days * 86400000).toISOString();
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

/* -------------------------------- Mock data ------------------------------ */
const ADMIN_STATS_INIT = {
  totalPatients: 1280,
  totalDoctors: 46,
  testsRun: 8920,
  assignmentsCompleted: 6410,
  aiEffectiveness: 0.72,
};

const ADMIN_ACCOUNTS_INIT = [
  {
    id: uid(),
    role: "patient",
    name: "Nguyễn Lan",
    email: "lan@example.com",
    active: true,
    createdAt: addDaysISO(-40),
    tests: 6,
  },
  {
    id: uid(),
    role: "patient",
    name: "Hoàng Long",
    email: "long@example.com",
    active: true,
    createdAt: addDaysISO(-12),
    tests: 2,
  },
  {
    id: uid(),
    role: "patient",
    name: "Trịnh My",
    email: "my@example.com",
    active: false,
    createdAt: addDaysISO(-80),
    tests: 1,
  },
  {
    id: "d001",
    role: "doctor",
    name: "Dr. Đặng",
    email: "dang@clinic.vn",
    active: true,
    createdAt: addDaysISO(-300),
    tests: 0,
  },
  {
    id: "d002",
    role: "doctor",
    name: "Dr. Lan",
    email: "lan.md@clinic.vn",
    active: false,
    createdAt: addDaysISO(-12),
    tests: 0,
  },
];

const ADMIN_DOCTORS_INIT = [
  {
    id: "d001",
    name: "Dr. Đặng",
    years: 8,
    role: "therapist",
    specializations: ["Trầm cảm", "Lo âu"],
    modalities: ["CBT", "Mindfulness"],
    rating: 4.8,
    status: "approved",
  },
  {
    id: "d002",
    name: "Dr. Lan",
    years: 4,
    role: "counselor",
    specializations: ["Mất ngủ"],
    modalities: ["CBT"],
    rating: 4.4,
    status: "pending",
  },
  {
    id: "d003",
    name: "Dr. Huy",
    years: 12,
    role: "psychiatrist",
    specializations: ["Hoảng sợ", "Trầm cảm"],
    modalities: ["Medication", "CBT"],
    rating: 4.6,
    status: "approved",
  },
  {
    id: "d004",
    name: "Dr. Nhi",
    years: 3,
    role: "therapist",
    specializations: ["Ám ảnh cưỡng chế"],
    modalities: ["ERP"],
    rating: 4.5,
    status: "rejected",
  },
];

const ADMIN_EXERCISES_INIT = [
  {
    id: uid(),
    code: "CBT_TR",
    name: "CBT Thought Record",
    method: "CBT",
    difficulty: "Easy",
    duration: "15–20m",
    target: ["Trầm cảm", "Lo âu"],
    updatedAt: addDaysISO(-5),
  },
  {
    id: uid(),
    code: "MF_BREATH",
    name: "Mindfulness 5–7–8",
    method: "Mindfulness",
    difficulty: "Easy",
    duration: "10m",
    target: ["Lo âu", "Mất ngủ"],
    updatedAt: addDaysISO(-9),
  },
  {
    id: uid(),
    code: "EXPOSURE_LITE",
    name: "Exposure Mini Hierarchy",
    method: "Exposure",
    difficulty: "Medium",
    duration: "20–30m",
    target: ["Ám ảnh cưỡng chế", "Sợ hãi"],
    updatedAt: addDaysISO(-2),
  },
  {
    id: uid(),
    code: "SLEEP_HYGIENE",
    name: "Sleep Hygiene Checklist",
    method: "Sleep",
    difficulty: "Easy",
    duration: "10–15m",
    target: ["Mất ngủ"],
    updatedAt: addDaysISO(-30),
  },
];

/* ------------------------------- Main shell ------------------------------ */
export default function AdminPortal() {
  const [nav, setNav] = useState("dashboard");
  const [stats] = useState(ADMIN_STATS_INIT);
  const [accounts, setAccounts] = useState(ADMIN_ACCOUNTS_INIT);
  const [doctors, setDoctors] = useState(ADMIN_DOCTORS_INIT);
  const [exercises, setExercises] = useState(ADMIN_EXERCISES_INIT);
  const [notifications, setNotifications] = useState([
    {
      id: uid(),
      type: "info",
      text: "1 hồ sơ bác sĩ đang chờ duyệt",
      at: new Date().toISOString(),
      read: false,
    },
  ]);

  // Exercise modal state (single-file management)
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState({
    id: null,
    code: "",
    name: "",
    method: "",
    difficulty: "Easy",
    duration: "10m",
    target: "",
  });

  // Actions
  const pendingDoctors = useMemo(
    () => doctors.filter((d) => d.status === "pending").length,
    [doctors]
  );
  const approveDoctor = (id) =>
    setDoctors((ds) =>
      ds.map((d) => (d.id === id ? { ...d, status: "approved" } : d))
    );
  const rejectDoctor = (id) =>
    setDoctors((ds) =>
      ds.map((d) => (d.id === id ? { ...d, status: "rejected" } : d))
    );
  const toggleAccountActive = (id) =>
    setAccounts((as) =>
      as.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );

  const openNewExercise = () => {
    setExerciseDraft({
      id: null,
      code: "",
      name: "",
      method: "",
      difficulty: "Easy",
      duration: "10m",
      target: "",
    });
    setOpenExerciseModal(true);
  };
  const openEditExercise = (ex) => {
    setExerciseDraft({ ...ex, target: ex.target.join(", ") });
    setOpenExerciseModal(true);
  };
  const saveExercise = () => {
    const payload = {
      ...exerciseDraft,
      target: (exerciseDraft.target || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
      id: exerciseDraft.id || uid(),
    };
    setExercises((list) => {
      const i = list.findIndex((e) => e.id === payload.id);
      return i >= 0
        ? list.map((e, idx) => (idx === i ? payload : e))
        : [payload, ...list];
    });
    setOpenExerciseModal(false);
  };
  const deleteExercise = (id) =>
    setExercises((list) => list.filter((e) => e.id !== id));

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-white md:block">
        <div className="flex items-center gap-2 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              Admin Portal
            </div>
            <div className="text-xs text-zinc-500">System Control</div>
          </div>
        </div>

        <nav className="space-y-1 p-2">
          {[
            { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
            { key: "accounts", label: "Tài khoản", icon: Users },
            { key: "doctors", label: "Bác sĩ", icon: UserCog },
            { key: "exercises", label: "Bài tập trị liệu", icon: FileStack },
            { key: "notifications", label: "Thông báo", icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setNav(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-zinc-50 ${
                nav === key ? "bg-zinc-100" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {key === "doctors" && pendingDoctors > 0 && (
                <span className="ml-auto text-xs">{pendingDoctors}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1300px] px-4 py-5">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold capitalize">{labelOf(nav)}</h1>
        </header>

        {nav === "dashboard" && (
          <AdminDashboard
            stats={stats}
            doctors={doctors}
            exercises={exercises}
          />
        )}
        {nav === "accounts" && (
          <AdminAccounts
            accounts={accounts}
            onToggleActive={toggleAccountActive}
          />
        )}
        {nav === "doctors" && (
          <AdminDoctors
            doctors={doctors}
            onApprove={approveDoctor}
            onReject={rejectDoctor}
          />
        )}
        {nav === "exercises" && (
          <AdminExercises
            exercises={exercises}
            onNew={openNewExercise}
            onEdit={openEditExercise}
            onDelete={deleteExercise}
          />
        )}
        {nav === "notifications" && (
          <NotificationsView notifications={notifications} />
        )}

        {/* Modal thêm/sửa bài tập */}
        <Modal
          open={openExerciseModal}
          title={exerciseDraft?.id ? "Sửa bài tập" : "Thêm bài tập"}
          onClose={() => setOpenExerciseModal(false)}
          footer={
            <div className="flex items-center justify-end gap-2">
              <IconBtn
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => setOpenExerciseModal(false)}
              >
                Hủy
              </IconBtn>
              <IconBtn
                className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={saveExercise}
              >
                Lưu
              </IconBtn>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-600">Code</label>
              <input
                value={exerciseDraft.code}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, code: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Tên bài tập</label>
              <input
                value={exerciseDraft.name}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, name: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Phương pháp</label>
              <input
                value={exerciseDraft.method}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, method: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Độ khó</label>
              <input
                value={exerciseDraft.difficulty}
                onChange={(e) =>
                  setExerciseDraft((s) => ({
                    ...s,
                    difficulty: e.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Thời lượng</label>
              <input
                value={exerciseDraft.duration}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, duration: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-600">
                Target symptoms (ngăn cách bằng dấu phẩy)
              </label>
              <input
                value={exerciseDraft.target}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, target: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              />
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

/* --------------------------------- Views --------------------------------- */
function AdminDashboard({ stats, doctors, exercises }) {
  const pending = doctors.filter((d) => d.status === "pending").length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icon={Users} label="Bệnh nhân" value={stats.totalPatients} />
        <StatCard icon={UserCog} label="Bác sĩ" value={stats.totalDoctors} />
        <StatCard icon={BarChart3} label="Bài test" value={stats.testsRun} />
        <StatCard
          icon={FileStack}
          label="Bài tập hoàn thành"
          value={stats.assignmentsCompleted}
        />
        <StatCard
          icon={ShieldCheck}
          label="AI hiệu quả"
          value={`${Math.round(stats.aiEffectiveness * 100)}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Phê duyệt bác sĩ</h3>
            <Badge tone={pending ? "warn" : "success"}>
              {pending ? `${pending} chờ duyệt` : "Không có yêu cầu"}
            </Badge>
          </div>
          <div className="space-y-2">
            {doctors
              .filter((d) => d.status === "pending")
              .slice(0, 5)
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{d.name}</div>
                    <div className="text-xs text-zinc-500">
                      {d.role} • {d.years} năm • {d.specializations.join(", ")}
                    </div>
                  </div>
                  <Badge tone="warn">pending</Badge>
                </div>
              ))}
            {pending === 0 && <div className="text-xs text-zinc-500">—</div>}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Kho bài tập trị liệu</h3>
            <div className="text-xs text-zinc-500">{exercises.length} mẫu</div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {exercises.map((e) => (
              <div key={e.id} className="rounded-xl border p-3">
                <div className="text-sm font-semibold">{e.name}</div>
                <div className="text-xs text-zinc-500">
                  {e.method} • {e.difficulty} • {e.duration}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  Target: {e.target.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
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
    </div>
  );
}

function AdminAccounts({ accounts }) {
  const [tab, setTab] = useState("patients"); // "patients" | "doctors"
  const [q, setQ] = useState("");

  const currencyVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(v || 0));

  const patients = useMemo(
    () => (accounts || []).filter((a) => a.role === "patient"),
    [accounts]
  );
  const doctorsAcc = useMemo(
    () => (accounts || []).filter((a) => a.role === "doctor"),
    [accounts]
  );

  const filteredPatients = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return patients;
    return patients.filter(
      (a) =>
        a.name.toLowerCase().includes(qq) || a.email.toLowerCase().includes(qq)
    );
  }, [q, patients]);

  const filteredDoctors = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return doctorsAcc;
    return doctorsAcc.filter(
      (a) =>
        a.name.toLowerCase().includes(qq) || a.email.toLowerCase().includes(qq)
    );
  }, [q, doctorsAcc]);

  // Thống kê nhanh
  const totalPatientBalance = patients.reduce(
    (s, a) => s + (a.walletBalance || 0),
    0
  );
  const avgPatientBalance = patients.length
    ? totalPatientBalance / patients.length
    : 0;

  const totalDoctorWeek = doctorsAcc.reduce(
    (s, a) => s + (a.revenueWeek || 0),
    0
  );
  const totalDoctorMonth = doctorsAcc.reduce(
    (s, a) => s + (a.revenueMonth || 0),
    0
  );
  const totalDoctorAll = doctorsAcc.reduce(
    (s, a) => s + (a.revenueTotal || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-xl border p-1">
          <button
            onClick={() => setTab("patients")}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              tab === "patients"
                ? "bg-zinc-900 text-white"
                : "hover:bg-zinc-100"
            }`}
          >
            Người dùng (Bệnh nhân)
          </button>
          <button
            onClick={() => setTab("doctors")}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              tab === "doctors" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
            }`}
          >
            Bác sĩ
          </button>
        </div>

        <div className="ml-auto relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Tìm nhanh trong ${
              tab === "patients" ? "bệnh nhân" : "bác sĩ"
            }…`}
            className="h-10 w-72 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Thống kê theo tab */}
      {tab === "patients" ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Users} label="Số bệnh nhân" value={patients.length} />
          <StatCard
            icon={BadgePercent}
            label="Tổng số dư"
            value={currencyVND(totalPatientBalance)}
          />
          <StatCard
            icon={ShieldCheck}
            label="Số dư bình quân"
            value={currencyVND(avgPatientBalance)}
          />
          <StatCard
            icon={BarChart3}
            label="Bài test (tổng)"
            value={patients.reduce((s, a) => s + (a.tests || 0), 0)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={UserCog}
            label="Số bác sĩ"
            value={doctorsAcc.length}
          />
          <StatCard
            icon={BarChart3}
            label="Doanh thu tuần"
            value={currencyVND(totalDoctorWeek)}
          />
          <StatCard
            icon={BarChart3}
            label="Doanh thu tháng"
            value={currencyVND(totalDoctorMonth)}
          />
          <StatCard
            icon={ShieldCheck}
            label="Tích luỹ"
            value={currencyVND(totalDoctorAll)}
          />
        </div>
      )}

      {/* Bảng dữ liệu theo tab (không còn Trạng thái/Hành động) */}
      <div className="overflow-auto rounded-2xl border bg-white">
        {tab === "patients" ? (
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">Người dùng</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
                <th className="px-4 py-2 text-left">Bài test</th>
                <th className="px-4 py-2 text-left">Số dư còn lại</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.name}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {a.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{fmtDate(a.createdAt)}</td>
                  <td className="px-4 py-2">{a.tests ?? 0}</td>
                  <td className="px-4 py-2">
                    {currencyVND(a.walletBalance || 0)}
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs text-zinc-500"
                  >
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-[960px] w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">Bác sĩ</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
                <th className="px-4 py-2 text-left">Doanh thu tuần</th>
                <th className="px-4 py-2 text-left">Doanh thu tháng</th>
                <th className="px-4 py-2 text-left">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.name}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {a.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{fmtDate(a.createdAt)}</td>
                  <td className="px-4 py-2">
                    {currencyVND(a.revenueWeek || 0)}
                  </td>
                  <td className="px-4 py-2">
                    {currencyVND(a.revenueMonth || 0)}
                  </td>
                  <td className="px-4 py-2">
                    {currencyVND(a.revenueTotal || 0)}
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-xs text-zinc-500"
                  >
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AdminDoctors({ doctors, onApprove, onReject }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      doctors.filter((d) => {
        const okQ =
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.specializations.join(", ").toLowerCase().includes(q.toLowerCase());
        const okS = status === "all" || d.status === status;
        return okQ && okS;
      }),
    [doctors, q, status]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm bác sĩ"
            className="h-10 w-64 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none"
        >
          <option value="all">Tất cả</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold">{d.name}</div>
            <div className="mt-1 text-xs text-zinc-500 capitalize">
              {d.role} • {d.years} năm
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Specs: {d.specializations.join(", ")}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Modalities: {d.modalities.join(", ")}
            </div>
            <div className="mt-2">
              <Badge
                tone={
                  d.status === "approved"
                    ? "success"
                    : d.status === "pending"
                    ? "warn"
                    : "danger"
                }
              >
                {d.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <IconBtn
                icon={Check}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => onApprove(d.id)}
              >
                Duyệt
              </IconBtn>
              <IconBtn
                icon={X}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => onReject(d.id)}
              >
                Từ chối
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminExercises({ exercises, onNew, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q.toLowerCase()) ||
          e.method.toLowerCase().includes(q.toLowerCase()) ||
          e.target.join(", ").toLowerCase().includes(q.toLowerCase())
      ),
    [exercises, q]
  );

  const diffTone = (d) => {
    const x = (d || "").toLowerCase();
    if (x === "easy") return "success";
    if (x === "medium") return "warn";
    return "danger";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm bài tập…"
            className="h-10 w-72 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <IconBtn icon={Plus} onClick={onNew}>
          Thêm bài tập
        </IconBtn>
      </div>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-[820px] w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Tên</th>
              <th className="px-4 py-2 text-left">Phương pháp</th>
              <th className="px-4 py-2 text-left">Độ khó</th>
              <th className="px-4 py-2 text-left">Thời lượng</th>
              <th className="px-4 py-2 text-left">Target</th>
              <th className="px-4 py-2 text-left">Cập nhật</th>
              <th className="px-4 py-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2 font-medium">{e.name}</td>
                <td className="px-4 py-2">{e.method}</td>
                <td className="px-4 py-2">
                  <Badge tone={diffTone(e.difficulty)}>{e.difficulty}</Badge>
                </td>
                <td className="px-4 py-2">{e.duration}</td>
                <td className="px-4 py-2">{e.target.join(", ")}</td>
                <td className="px-4 py-2">{fmtDate(e.updatedAt)}</td>
                <td className="px-4 py-2 text-right">
                  <IconBtn icon={Edit3} onClick={() => onEdit(e)}>
                    Sửa
                  </IconBtn>
                  <IconBtn
                    icon={Trash2}
                    className="text-rose-600"
                    onClick={() => onDelete(e.id)}
                  >
                    Xóa
                  </IconBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Bars({ labels, values }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-3 space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-20 text-xs text-zinc-500">{labels[i]}</div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900"
              style={{ width: `${Math.round((v / max) * 100)}%` }}
            />
          </div>
          <div className="w-8 text-right text-xs">{v}</div>
        </div>
      ))}
    </div>
  );
}

function NotificationsView({ notifications }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 text-sm font-semibold">Thông báo</div>
      <div className="space-y-2">
        {(notifications || []).map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between rounded-xl border p-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm">{n.text}</div>
              <div className="text-xs text-zinc-500">{fmtDateTime(n.at)}</div>
            </div>
            <Badge tone="info">{n.type}</Badge>
          </div>
        ))}
        {(!notifications || notifications.length === 0) && (
          <div className="text-xs text-zinc-500">Không có thông báo.</div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Utils --------------------------------- */
function labelOf(key) {
  switch (key) {
    case "dashboard":
      return "Tổng quan";
    case "accounts":
      return "Tài khoản";
    case "doctors":
      return "Bác sĩ / Phê duyệt";
    case "exercises":
      return "Bài tập trị liệu";

    case "notifications":
      return "Thông báo";
    default:
      return key;
  }
}
