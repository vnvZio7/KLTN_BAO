import React from "react";
import { X } from "lucide-react";

/* ---------- Helpers chung ---------- */
export const fmtDate = (d) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(d));

export const fmtTime = (d) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export const fmtDateTime = (d) => `${fmtDate(d)} • ${fmtTime(d)}`;

export const uid = () => Math.random().toString(36).slice(2, 9);

export const todayISO = () => new Date().toISOString();

export const withinSameDay = (a, b = new Date()) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// PHQ-9 classification (0–27)
export function classifyPHQ9(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  return { label: "Nặng", tone: "danger" };
}

// GAD-7 classification (0–21)
export function classifyGAD7(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  return { label: "Nặng", tone: "danger" };
}

export function toneToClass(tone) {
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

/* ---------- UI primitives ---------- */

export const IconBtn = ({ icon: Icon, className = "", children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 active:bg-zinc-100 ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />} {children}
    </button>
  );
};

export const Badge = ({ tone = "default", children }) => {
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

export const Modal = ({ open, title, onClose, children, footer }) => {
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

export const Empty = ({ icon: Icon, title, hint }) => (
  <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center text-zinc-600">
    <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-zinc-100">
      {Icon && <Icon className="h-6 w-6" />}
    </div>
    <div className="text-sm font-medium">{title}</div>
    {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
  </div>
);

export const Progress = ({ value = 0, max = 100, label }) => (
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
        style={{ width: `${(value / max) * 100 || 0}%` }}
      />
    </div>
  </div>
);

export function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(val) {
  if (!val) return "";
  const d = new Date(val);
  // convert local -> UTC ISO
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

export function nameOf(listOrPatients, id) {
  const arr = Array.isArray(listOrPatients) ? listOrPatients : [];
  return arr.find((p) => p.id === id)?.name || id || "";
}

export function Avatar({ name, size = 9, patients }) {
  const label = typeof name === "string" ? name : nameOf(patients || [], name);
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
