import React, { useMemo, useState } from "react";
import Avatar from "../../components/doctor/Avatar";
import IconBtn from "../../components/doctor/IconBtn";
import Empty from "../../components/doctor/Empty";
import { fmtTime, fmtDate } from "../../lib/date";
import { CalendarDays, PhoneCall, Plus } from "lucide-react";

export default function CalendarView({ calls, patients, onSchedule }) {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = hôm nay

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, []);

  const dayCalls = useMemo(() => {
    const d = days[selectedDay];
    return calls.filter((c) => {
      const cc = new Date(c.time);
      return (
        cc.getDate() === d.getDate() &&
        cc.getMonth() === d.getMonth() &&
        cc.getFullYear() === d.getFullYear()
      );
    });
  }, [selectedDay, days, calls]);

  return (
    <div className="space-y-4">
      {/* Top Date Selector */}
      <div className="flex gap-2 overflow-auto pb-2">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`rounded-xl border px-4 py-2 text-sm ${
              i === selectedDay ? "bg-zinc-900 text-white" : ""
            }`}
          >
            <div className="font-semibold">{fmtDate(d)}</div>
            <div className="text-xs text-zinc-500">
              {d.toLocaleDateString("vi-VN", { weekday: "short" })}
            </div>
          </button>
        ))}
      </div>

      {/* Add schedule */}
      <IconBtn
        icon={Plus}
        className="bg-zinc-900 text-white"
        onClick={onSchedule}
      >
        Tạo lịch mới
      </IconBtn>

      {/* Day schedule */}
      <div className="space-y-3">
        {dayCalls.length === 0 ? (
          <Empty
            icon={CalendarDays}
            title="Không có lịch"
            hint="Hãy tạo lịch mới"
          />
        ) : (
          dayCalls
            .sort((a, b) => +new Date(a.time) - +new Date(b.time))
            .map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <Avatar name={c.patientName} />

                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.patientName}</div>
                  <div className="text-xs text-zinc-500">
                    {fmtTime(c.time)} • {c.duration || 45} phút
                  </div>
                </div>

                <IconBtn icon={PhoneCall}>Bắt đầu</IconBtn>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
