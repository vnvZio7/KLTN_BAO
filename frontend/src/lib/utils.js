// src/lib/utils.js
export const uid = () => Math.random().toString(36).slice(2, 9);

export function nameOf(list, id) {
  return (list || []).find((p) => p.id === id)?.name || String(id);
}

export function buildWeek(ref = new Date()) {
  const d = new Date(ref);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diffToMon = (day + 6) % 7; // Monday start
  d.setDate(d.getDate() - diffToMon);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
}

export function dayLabel(d) {
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const idx = (d.getDay() + 6) % 7;
  return `${dayNames[idx]}\n${d.getDate()}`;
}
