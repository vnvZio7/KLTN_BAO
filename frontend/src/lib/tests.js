// src/lib/tests.js
export function classifyPHQ9(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  if (score <= 19) return { label: "Nặng vừa", tone: "alert" };
  return { label: "Rất nặng", tone: "danger" };
}

export function classifyGAD7(score = 0) {
  if (score <= 4) return { label: "Bình thường", tone: "ok" };
  if (score <= 9) return { label: "Nhẹ", tone: "mild" };
  if (score <= 14) return { label: "Trung bình", tone: "warn" };
  return { label: "Nặng", tone: "danger" };
}

export function toneToClass(tone) {
  switch (tone) {
    case "ok": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "mild": return "bg-sky-100 text-sky-700 border-sky-200";
    case "warn": return "bg-amber-100 text-amber-800 border-amber-200";
    case "alert": return "bg-orange-100 text-orange-800 border-orange-200";
    case "danger": return "bg-rose-100 text-rose-700 border-rose-200";
    default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}
