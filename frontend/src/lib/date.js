// ---------------- Date Helpers ----------------

export function fmtDate(d) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(d));
}

export function fmtTime(d) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function fmtDateTime(d) {
  return `${fmtDate(d)} • ${fmtTime(d)}`;
}

export function addDaysISO(days = 0, atHour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(atHour, 0, 0, 0);
  return d.toISOString();
}

export function addMinsISO(mins = 0) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

export function withinSameDay(a, b = new Date()) {
  const da = new Date(a),
    db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const f = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${f(d.getMonth() + 1)}-${f(d.getDate())}T${f(
    d.getHours()
  )}:${f(d.getMinutes())}`;
}

export function fromLocalInputValue(val) {
  const d = new Date(val);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}
