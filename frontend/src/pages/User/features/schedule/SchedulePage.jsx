import React, { useMemo, useState } from "react";
import { prettyTime } from "../../../../utils/helper";

export default function SchedulePage({
  doctor,
  appointments,
  setAppointments,
  onBooked,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const quickTimes = useMemo(
    () =>
      Array.from(
        new Set((doctor?.nextSlots || []).map((s) => s.slice(11, 16)))
      ),
    [doctor]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!date || !time) return alert("Vui lòng chọn ngày giờ");
    setLoading(true);
    try {
      const iso = new Date(`${date}T${time}`).toISOString();
      const item = {
        id: Math.random().toString(36).slice(2),
        doctorId: doctor.id,
        doctorName: doctor.name,
        time: iso,
        status: "upcoming",
        reason,
      };
      setAppointments([item, ...(appointments || [])]);
      onBooked?.(item);
      setReason("");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">Đặt lịch gọi video</h2>
        <p className="text-slate-600 mb-6">
          Chọn thời gian phù hợp để gọi với {doctor?.name}.
        </p>
        <form onSubmit={submit} className="grid md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Ngày</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giờ</label>
            <input
              type="time"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              list="quick-times"
              required
            />
            <datalist id="quick-times">
              {quickTimes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Lý do (tuỳ chọn)
            </label>
            <input
              type="text"
              placeholder="VD: mất ngủ 3 ngày gần đây"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Đang đặt…" : "Đặt lịch"}
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-1">Lịch đã đặt</h3>
        <p className="text-slate-600 mb-4">
          Bạn sẽ nhận nhắc nhở trước 15 phút.
        </p>
        <div className="divide-y">
          {(appointments || []).length === 0 && (
            <div className="text-slate-500">Chưa có lịch hẹn nào.</div>
          )}
          {(appointments || []).map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{prettyTime(a.time)}</div>
                <div className="text-sm text-slate-600">
                  {a.doctorName} · {a.reason || "Không có ghi chú"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    a.status === "upcoming"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {a.status === "upcoming" ? "Sắp diễn ra" : a.status}
                </span>
                <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700">
                  Huỷ
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  Vào phòng
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
