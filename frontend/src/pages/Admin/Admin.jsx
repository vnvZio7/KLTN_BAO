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
  Info,
  Snowflake,
  XIcon,
  SunSnow,
  CloudSnow,
  SunDim,
  ChevronRight,
  ChevronsRightIcon,
} from "lucide-react";
import { useUserContext } from "../../context/userContext";
import { currencyVND } from "../../lib/utils";
import axiosInstance from "../../utils/axiosInstance";
import { useCallback } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { prettyTime } from "../../utils/helper";

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
  const {
    handleLogout,
    exercises,
    doctors,
    loading,
    setLoading,
    accounts,
    transactions,
  } = useUserContext();
  const [nav, setNav] = useState("dashboard");
  const [stats] = useState(ADMIN_STATS_INIT);
  const [dataDoctors, setDataDoctors] = useState([]);
  useEffect(() => {
    if (!loading) {
      setDataDoctors(doctors);
    }
  }, [doctors]);
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
    () => dataDoctors.filter((d) => d.approval.status === "pending").length,
    [dataDoctors]
  );
  // const approveDoctor = useCallback(
  //   async (id) => {
  //     try {
  //       setLoading(true);

  //       // GỌI API BACKEND
  //       const res = await axiosInstance.patch(
  //         `/api/admin/doctors/${id}/approval`,
  //         {
  //           status: "approved",
  //         }
  //       );

  //       const updated = res.data; // giả sử backend trả về doctor đã update
  //       console.log(updated);
  //       // CẬP NHẬT UI
  //       setDataDoctors((ds) =>
  //         ds.map((d) =>
  //           d._id === id
  //             ? {
  //                 ...d,
  //                 // nếu bạn dùng nested: d.approval.status
  //                 approval: {
  //                   ...(d.approval || {}),
  //                   status: updated.approval?.status || "approved",
  //                 },
  //               }
  //             : d
  //         )
  //       );
  //     } catch (err) {
  //       console.error("Approve doctor error:", err);
  //       // TODO: toast / alert
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [setDataDoctors]
  // );
  const updateApproval = useCallback(
    async (id, status, reason = "") => {
      try {
        setLoading(true);

        const res = await axiosInstance.patch(
          `/api/admin/doctors/${id}/approval`,
          { status, reason }
        );

        // Nếu server xóa doctor khi rejected
        if (res?.data?.id) {
          toast.success(
            res?.data?.message || "Đã từ chối và xoá hồ sơ bác sĩ khỏi hệ thống"
          );
          setDataDoctors((ds) => ds.filter((d) => d._id !== id));
          return;
        }

        const updated = res.data.doctor; // backend trả field "data"
        toast.success(res.data.message || "Cập nhật trạng thái thành công");
        // Cập nhật UI
        setDataDoctors((ds) =>
          ds.map((d) =>
            d._id === id
              ? {
                  ...d,
                  approval: {
                    ...(d.approval || {}),
                    status: updated.approval?.status || status,
                  },
                }
              : d
          )
        );
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    },
    [setDataDoctors]
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
    setExerciseDraft({ ...ex, target: ex.targetSymptoms.join(", ") });
    setOpenExerciseModal(true);
  };
  const saveExercise = () => {
    const payload = {
      ...exerciseDraft,
      target: (exerciseDraft.targetSymptoms || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
      id: exerciseDraft._id || uid(),
    };
    // setexercises((list) => {
    //   const i = list.findIndex((e) => e._id === payload._id);
    //   return i >= 0
    //     ? list.map((e, idx) => (idx === i ? payload : e))
    //     : [payload, ...list];
    // });
    setOpenExerciseModal(false);
  };
  // const deleteExercise = (id) =>
  //   setexercises((list) => list.filter((e) => e._id !== id));

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
            { key: "doctors", label: "Phê duyệt bác sĩ", icon: UserCog },
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
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50"
          >
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
            doctors={dataDoctors}
            exercises={exercises}
            setNav={setNav}
          />
        )}
        {nav === "accounts" && (
          <AdminAccounts accounts={accounts} transactions={transactions} />
        )}
        {nav === "doctors" && (
          <AdminDoctors
            doctors={dataDoctors}
            onUpdateApproval={updateApproval}
          />
        )}
        {nav === "exercises" && (
          <AdminExercises
            exercises={exercises}
            onNew={openNewExercise}
            onEdit={openEditExercise}
            // onDelete={deleteExercise}
          />
        )}
        {nav === "notifications" && (
          <NotificationsView notifications={notifications} />
        )}

        {/* Modal thêm/sửa bài tập */}
        <Modal
          open={openExerciseModal}
          title={exerciseDraft?._id ? "Sửa bài tập" : "Thêm bài tập"}
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Tiêu đề bài tập */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">
                  Tên / tiêu đề bài tập <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: Thực hành thở chậm 4-7-8"
                  value={exerciseDraft.title || ""}
                  onChange={(e) =>
                    setExerciseDraft((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>

              {/* Phương pháp */}
              <div>
                <label className="block text-sm font-medium">Phương pháp</label>
                <input
                  type="text"
                  className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: CBT, ACT, Mindfulness…"
                  value={exerciseDraft.method || ""}
                  onChange={(e) =>
                    setExerciseDraft((s) => ({ ...s, method: e.target.value }))
                  }
                />
              </div>

              {/* Độ khó */}
              <div>
                <label className="block text-sm font-medium">Độ khó</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400 bg-white"
                  value={exerciseDraft.difficulty || "easy"}
                  onChange={(e) =>
                    setExerciseDraft((s) => ({
                      ...s,
                      difficulty: e.target.value,
                    }))
                  }
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              {/* Thời lượng */}
              <div>
                <label className="block text-sm font-medium">
                  Thời lượng ước tính (phút)
                </label>
                <input
                  type="number"
                  min={1}
                  className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: 10"
                  value={exerciseDraft.estimatedMinutes ?? ""}
                  onChange={(e) =>
                    setExerciseDraft((s) => ({
                      ...s,
                      estimatedMinutes: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>

              {/* Target symptoms */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">
                  Target symptoms (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="VD: Trầm cảm, Lo âu, Mất ngủ…"
                  value={(exerciseDraft.targetSymptoms || []).join(", ")}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setExerciseDraft((s) => ({ ...s, targetSymptoms: arr }));
                  }}
                />
              </div>
            </div>

            {/* Nội dung / hướng dẫn chi tiết */}
            <div>
              <label className="block text-sm font-medium">
                Nội dung / Hướng dẫn chi tiết
              </label>
              <textarea
                rows={4}
                className="placeholder:text-gray-400 mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                placeholder={`VD:
- Giải thích mục tiêu bài tập
- Các bước thực hiện cụ thể
- Lưu ý khi làm bài
- Cách ghi nhận kết quả`}
                value={exerciseDraft.content || ""}
                onChange={(e) =>
                  setExerciseDraft((s) => ({ ...s, content: e.target.value }))
                }
              />
            </div>

            {/* Attachments: list link, backend map sang [String] */}
            <div>
              <label className="block text-sm font-medium">
                Đính kèm (link file/audio/video, ngăn cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                className="placeholder:text-gray-400 mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                placeholder="https://..., https://..."
                value={(exerciseDraft.attachments || []).join(", ")}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  setExerciseDraft((s) => ({ ...s, attachments: arr }));
                }}
              />
              {exerciseDraft.attachments?.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                  {exerciseDraft.attachments.map((a) => (
                    <li key={a} className="truncate">
                      • {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

/* --------------------------------- Views --------------------------------- */
function AdminDashboard({ stats, doctors, exercises, setNav }) {
  const pending = doctors.filter((d) => d.approval.status === "pending").length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Users} label="Bệnh nhân" value={stats.totalPatients} />
        <StatCard icon={UserCog} label="Bác sĩ" value={stats.totalDoctors} />
        <StatCard icon={BarChart3} label="Bài test" value={stats.testsRun} />
        <StatCard
          icon={FileStack}
          label="Bài tập hoàn thành"
          value={stats.assignmentsCompleted}
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
              .filter((d) => d.approval.status === "pending")
              .slice(0, 5)
              .map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {d.accountId.fullName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {d.role} • {d.yearsExperience} năm •{" "}
                      {d.specializations.join(", ")}
                    </div>
                  </div>
                  <Badge tone="warn">pending</Badge>
                </div>
              ))}
            <div className="justify-center w-full flex">
              <IconBtn className="py-1.5!" onClick={() => setNav("doctors")}>
                Xem tất cả <ChevronsRightIcon className="w-4 h-4" />
              </IconBtn>
            </div>
            {pending === 0 && <div className="text-xs text-zinc-500">—</div>}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 ">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Kho bài tập trị liệu</h3>
            <div className="text-xs text-zinc-500">{exercises.length} mẫu</div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {exercises.slice(0, 8).map((e) => (
              <div key={e._id} className="rounded-xl border p-3">
                <div className="text-sm font-semibold">{e.title}</div>
                <div className="text-xs text-zinc-500">
                  {e.method} • {e.difficulty} • {e.estimatedMinutes} m
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  Target: {e.targetSymptoms.join(", ")}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 justify-center w-full flex">
            <IconBtn className="py-1.5!" onClick={() => setNav("exercises")}>
              Xem tất cả <ChevronsRightIcon className="w-4 h-4" />
            </IconBtn>
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

function AdminAccounts({ accounts, transactions }) {
  const [tab, setTab] = useState("patients"); // "patients" | "doctors"
  const [q, setQ] = useState("");

  const patients = useMemo(() => accounts.users || [], [accounts]);
  const doctorsAcc = useMemo(() => accounts.doctors || [], [accounts]);
  console.log(doctorsAcc);
  const filteredPatients = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return patients;
    return patients.filter(
      (a) =>
        a.accountId.fullName.toLowerCase().includes(qq) ||
        a.accountId.email.toLowerCase().includes(qq)
    );
  }, [q, patients]);
  const filteredDoctors = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return doctorsAcc;
    return doctorsAcc.filter(
      (a) =>
        a.accountId.fullName.toLowerCase().includes(qq) ||
        a.accountId.email.toLowerCase().includes(qq)
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

  const countPatients = (doctorId) => {
    return patients.filter((p) => p.currentDoctorId === doctorId).length;
  };
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());

  // tuỳ bạn, có thể hard-code range năm hoặc lấy theo dữ liệu
  const years = [];
  for (let y = now.getFullYear() - 3; y <= now.getFullYear() + 1; y++) {
    years.push(y);
  }
  const sumMonth = (doctorId, month, year) => {
    if (!doctorId || !Array.isArray(transactions)) return 0;

    const start = new Date(year, month - 1, 1); // đầu tháng
    const end = new Date(year, month, 1); // đầu tháng sau

    return transactions
      .filter((t) => {
        if (t.status !== "paid") return false;
        if (!t.doctorId) return false;
        if (t.doctorId !== doctorId) return false;

        const paid = new Date(t.paidAt);
        return paid >= start && paid < end;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };
  console.log(transactions);

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

        {tab === "doctors" && (
          <div className="ml-auto mr-0">
            <select
              className="h-9 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, idx) => {
                const m = idx + 1;
                return (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                );
              })}
            </select>
            {/* Chọn năm */}
            <select
              className="h-9 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
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
          <table className="min-w-[820px] w-full text-sm ">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">Người dùng</th>
                <th className="px-4 py-2 text-center">Ngày tạo</th>
                <th className="px-4 py-2 w-30 text-center">
                  Số lần làm bài test
                </th>
                <th className="px-4 py-2 text-center w-30">
                  Điểm PHQ-9 (gần nhất)
                </th>
                <th className="px-4 py-2 text-center w-30">
                  Điểm GAD-7 (gần nhất)
                </th>
                <th className="px-4 py-2 text-center">Tình trạng</th>
                <th className="px-4 py-2 text-center">Bác sĩ hiện tại</th>
                <th className="px-4 py-2 text-right">Số dư còn lại</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.accountId.fullName} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {a.accountId.fullName}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {a.accountId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {prettyTime(a.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.testHistory?.length / 2 || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.lastPHQ9Score || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.lastGAD7Score || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.dominantSymptom || "Chưa xác minh"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {doctorsAcc.find((d) => d._id === a.currentDoctorId)
                      ?.accountId?.fullName || "Chưa kết nối đến bác sĩ"}
                  </td>
                  <td className="px-4 py-2 text-right">
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
                <th className="px-4 py-2 text-center">Bác sĩ</th>
                <th className="px-4 py-2 text-center">Số điện thoại</th>
                <th className="px-4 py-2 text-center">Ngày tạo</th>
                <th className="px-4 py-2 text-center">Số bệnh nhân</th>
                <th className="px-4 py-2 text-center">Chuyên môn</th>
                <th className="px-4 py-2 text-center">Số năm kinh nghiệm</th>
                <th className="px-4 py-2 text-right">
                  Doanh thu tháng {/* Chọn tháng */}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.accountId.fullName} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {a.accountId.fullName}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {a.accountId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">{a.accountId.phone}</td>
                  <td className="px-4 py-2 text-center">
                    {prettyTime(a.accountId.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {countPatients(a._id) || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.specializations || "Không xác định"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {a.yearsExperience || 0} năm
                  </td>
                  <td className="px-4 py-2 text-center">
                    {currencyVND(
                      sumMonth(a._id, selectedMonth, selectedYear) || 0
                    )}
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

function DoctorDetailModal({ doctor, onClose, onUpdateApproval }) {
  const { loading } = useUserContext();
  const [selectedCert, setSelectedCert] = useState(null); // ảnh chứng chỉ đang phóng to
  const [showRejectReason, setShowRejectReason] = useState(false);

  if (!doctor) return null;

  const acc = doctor.accountId || {};
  const status = doctor.approval?.status || "pending";

  const handleUpdateApproved = (status) => {
    onUpdateApproval?.(doctor._id, status);
    onClose();
  };

  const badgeTone =
    status === "approved"
      ? "success"
      : status === "pending"
      ? "warn"
      : status === "frozen"
      ? "danger"
      : "default";

  const fullName = acc.fullName || "Không rõ tên";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const hasCertificates =
    Array.isArray(doctor.certificates) && doctor.certificates.length > 0;

  return (
    <>
      {/* Modal chính */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100">
                {doctor.avatar ? (
                  <img
                    src={doctor.avatar}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
                    {initials}
                  </div>
                )}
              </div>

              <div>
                <div className="text-base font-semibold">{fullName}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {doctor.role} • {doctor.yearsExperience || 0} năm kinh nghiệm
                </div>
                {acc.email && (
                  <div className="mt-1 text-xs text-zinc-500">
                    Email: {acc.email}
                  </div>
                )}
                {acc.phone && (
                  <div className="mt-1 text-xs text-zinc-500">
                    SĐT: {acc.phone}
                  </div>
                )}
              </div>
            </div>

            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status */}
          <div className="mb-4">
            <Badge tone={badgeTone}>{status}</Badge>
          </div>

          {/* Body */}
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-zinc-500">
                Chuyên môn
              </div>
              <div>{doctor.specializations?.join(", ") || "—"}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-500">
                Phương pháp trị liệu
              </div>
              <div>{doctor.modalities?.join(", ") || "—"}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-500">
                  Giá / tuần
                </div>
                <div>
                  {doctor.pricePerWeek
                    ? doctor.pricePerWeek.toLocaleString("vi-VN") + " đ"
                    : "Chưa đặt"}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-500">
                Giới thiệu
              </div>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                {doctor.bio || "Chưa có mô tả."}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-500">
                Chứng chỉ
              </div>
              {hasCertificates ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {doctor.certificates.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="overflow-hidden rounded-lg border bg-zinc-50"
                      onClick={() => setSelectedCert(c)}
                    >
                      <img
                        src={c}
                        alt={`certificate-${idx}`}
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">
                  Không có chứng chỉ hành nghề
                </p>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-zinc-500"></div>

            <div className="flex flex-wrap gap-2">
              {status === "pending" && (
                <>
                  <IconBtn
                    icon={Check}
                    disabled={loading}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleUpdateApproved("approved")}
                  >
                    {loading ? "Đang duyệt..." : "Duyệt"}
                  </IconBtn>
                  <IconBtn
                    icon={XIcon}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => setShowRejectReason(true)} // mở popup hỏi lý do
                  >
                    Từ chối
                  </IconBtn>
                </>
              )}

              {status === "approved" && (
                <IconBtn
                  icon={Snowflake}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => handleUpdateApproved("frozen")}
                >
                  Đóng băng
                </IconBtn>
              )}

              {status === "frozen" && (
                <IconBtn
                  icon={SunDim}
                  className="border-red-200 text-red-500 hover:bg-red-50"
                  onClick={() => handleUpdateApproved("approved")}
                >
                  Mở đóng băng
                </IconBtn>
              )}

              <button
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>
          <RejectReasonModal
            open={showRejectReason}
            onClose={() => setShowRejectReason(false)}
            onSubmit={(reason) => {
              onUpdateApproval(doctor._id, "rejected", reason);
              setShowRejectReason(false);
              onClose();
            }}
          />
        </div>
      </div>

      {/* Lightbox xem chứng chỉ to */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative max-h-[95vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCert}
              alt="certificate-large"
              className="max-h-[95vh] max-w-4xl rounded-2xl object-contain bg-white"
            />
            <button
              className="absolute -right-3 -top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-700 shadow"
              onClick={() => setSelectedCert(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function RejectReasonModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold">Từ chối hồ sơ bác sĩ</div>
        <p className="mt-2 text-sm text-zinc-600">
          Bạn có chắc muốn từ chối? Hãy nhập lý do:
        </p>

        <textarea
          className="mt-3 w-full rounded-xl border border-zinc-300 p-3 text-sm outline-none"
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-100"
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
            onClick={() => {
              if (!reason || reason.trim().length < 3) {
                alert("Lý do phải có tối thiểu 3 ký tự."); // hoặc toast
                return;
              }
              onSubmit(reason);
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDoctors({ doctors, onUpdateApproval }) {
  const { loading } = useUserContext();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("pending"); // "pending" | "approved"
  const [selected, setSelected] = useState(null); // bác sĩ đang xem chi tiết
  const [showRejectReason, setShowRejectReason] = useState(false);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchQ =
        d.accountId.fullName.toLowerCase().includes(q.toLowerCase()) ||
        d.specializations.join(", ").toLowerCase().includes(q.toLowerCase());

      const matchTab =
        tab === "pending"
          ? d.approval.status === "pending"
          : ["approved", "frozen"].includes(d.approval.status);
      return matchQ && matchTab;
    });
  }, [doctors, q, tab]);
  return (
    <div className="space-y-4">
      {/* Search + Tabs */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Tìm bác sĩ..."
          className="h-10 rounded-xl border px-3 text-sm outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-xl text-sm border ${
              tab === "pending"
                ? "bg-zinc-900 text-white"
                : "bg-white hover:bg-zinc-50"
            }`}
            onClick={() => setTab("pending")}
          >
            Đang chờ duyệt
          </button>

          <button
            className={`px-4 py-2 rounded-xl text-sm border ${
              tab === "approved"
                ? "bg-zinc-900 text-white"
                : "bg-white hover:bg-zinc-50"
            }`}
            onClick={() => setTab("approved")}
          >
            Đã duyệt
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {!filtered ? (
          <div>Không có yêu cầu nào của bác sĩ</div>
        ) : (
          filtered.map((d) => (
            <div key={d._id} className="rounded-2xl border bg-white p-4">
              <div className="text-sm font-semibold">
                {d.accountId.fullName}
              </div>
              <div className="mt-1 text-xs text-zinc-500 capitalize">
                {d.role} • {d.yearsExperience || 0} năm kinh nghiệm •{" "}
                {currencyVND(d.pricePerWeek) || 0} / tuần
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                Chuyên môn: {d.specializations.join(", ")}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Phương pháp: {d.modalities.join(", ")}
              </div>

              <div className="mt-2">
                <Badge
                  tone={
                    d.approval.status === "approved"
                      ? "success"
                      : d.approval.status === "pending"
                      ? "warn"
                      : "danger"
                  }
                >
                  {d.approval.status}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {tab === "pending" && (
                  <>
                    <IconBtn
                      icon={Check}
                      disabled={loading}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => onUpdateApproval(d._id, "approved")}
                    >
                      {loading ? "Đang duyệt..." : "Duyệt"}
                    </IconBtn>

                    <IconBtn
                      icon={XIcon}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        setShowRejectReason(true);
                      }} // mở popup hỏi lý do
                    >
                      Từ chối
                    </IconBtn>
                  </>
                )}

                {tab === "approved" &&
                  (d.approval.status === "approved" ? (
                    <IconBtn
                      icon={Snowflake}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => onUpdateApproval(d._id, "frozen")}
                    >
                      Đóng băng
                    </IconBtn>
                  ) : (
                    <IconBtn
                      icon={SunDim}
                      className="border-red-200 text-red-500 hover:bg-red-50"
                      onClick={() => onUpdateApproval(d._id, "approved")}
                    >
                      Mở đóng băng
                    </IconBtn>
                  ))}

                <IconBtn
                  icon={Info}
                  className="border-yellow-200 text-yellow-800"
                  onClick={() => setSelected(d)}
                >
                  Chi tiết
                </IconBtn>
                <RejectReasonModal
                  open={showRejectReason}
                  onClose={() => setShowRejectReason(false)}
                  onSubmit={(reason) => {
                    onUpdateApproval(d._id, "rejected", reason);
                    setShowRejectReason(false);
                    // onClose();
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL CHI TIẾT */}
      <DoctorDetailModal
        doctor={selected}
        onClose={() => setSelected(null)}
        onUpdateApproval={onUpdateApproval}
      />
    </div>
  );
}

function AdminExercises({ exercises, onNew, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          e.title.toLowerCase().includes(q.toLowerCase()) ||
          e.method.toLowerCase().includes(q.toLowerCase()) ||
          e.targetSymptoms.join(", ").toLowerCase().includes(q.toLowerCase())
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
        <div className="overflow-auto max-h-[590px]">
          <table className="min-w-[820px] w-full text-sm table-fixed">
            <thead className="bg-zinc-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Tên</th>
                <th className="px-4 py-2 text-left ">Phương pháp</th>
                <th className="px-4 py-2 text-left">Độ khó</th>
                <th className="px-4 py-2 text-left">Thời lượng</th>
                <th className="px-4 py-2 text-left ">Target</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
                <th className="px-4 py-2 text-center ">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-2 font-medium">{e.title}</td>
                  <td className="px-4 py-2">{e.method}</td>
                  <td className="px-4 py-2">
                    <Badge tone={diffTone(e.difficulty)}>{e.difficulty}</Badge>
                  </td>
                  <td className="px-4 py-2">{e.estimatedMinutes} phút</td>
                  <td className="px-4 py-2">{e.targetSymptoms.join(", ")}</td>
                  <td className="px-4 py-2">{fmtDate(e.updatedAt)}</td>
                  <td className="px-4 py-2 text-right flex gap-1">
                    <IconBtn icon={Edit3} onClick={() => onEdit(e)}>
                      Sửa
                    </IconBtn>
                    <IconBtn
                      icon={Trash2}
                      className="text-rose-600"
                      onClick={() => onDelete(e._id)}
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
