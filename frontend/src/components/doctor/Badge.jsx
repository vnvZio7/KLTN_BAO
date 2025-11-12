// src/components/ui/Badge.jsx
import React from "react";

const map = {
  default: "bg-zinc-100 text-zinc-700 border-zinc-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warn: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function Badge({ tone = "default", children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${map[tone] || map.default}`}>
      {children}
    </span>
  );
}
