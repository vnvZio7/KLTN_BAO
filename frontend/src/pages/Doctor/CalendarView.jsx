// src/views/CalendarView.jsx
import React from "react";
import Badge from "../../components/doctor/Badge";
import { buildWeek, dayLabel, nameOf } from "../../lib/utils";
import { fmtDate, fmtDateTime } from "../../lib/date";
import { Clock, Video } from "lucide-react";

export default function CalendarView({
  calls,
  availability,
  patients,
  onAddAvail,
}) {
  const week = buildWeek();
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 08:00 - 19:00

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tuần này</h3>
        <Badge tone="default">
          {fmtDate(week[0])} → {fmtDate(week[6])}
        </Badge>
      </div>
      <div className="grid grid-cols-8 border-t text-xs">
        <div className="sticky left-0 z-10 bg-white p-2 font-medium">Giờ</div>
        {week.map((d) => (
          <div
            key={d.toISOString()}
            className="p-2 text-center font-medium whitespace-pre-line"
          >
            {dayLabel(d)}
          </div>
        ))}
      </div>
      {hours.map((h) => (
        <div key={h} className="grid grid-cols-8 border-t">
          <div className="sticky left-0 z-10 bg-white p-2 text-xs text-zinc-500">
            {String(h).padStart(2, "0")}:00
          </div>
          {week.map((d) => (
            <CalendarCell
              key={d.toISOString() + h}
              date={d}
              hour={h}
              calls={calls}
              availability={availability}
              patients={patients}
              onAddAvail={onAddAvail}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CalendarCell({
  date,
  hour,
  calls,
  availability,
  patients,
  onAddAvail,
}) {
  const cellStart = new Date(date);
  cellStart.setHours(hour, 0, 0, 0);
  const cellEnd = new Date(date);
  cellEnd.setHours(hour + 1, 0, 0, 0);

  const items = [
    ...calls.map((c) => ({
      type: "call",
      time: new Date(c.time),
      label: `${nameOf(patients, c.patientId)} • gọi`,
    })),
    ...availability.map((a) => ({
      type: "avail",
      time: new Date(a),
      label: "Khả dụng",
    })),
  ].filter((it) => it.time >= cellStart && it.time < cellEnd);

  return (
    <div className="min-h-[56px] border-l p-1">
      {items.length === 0 ? (
        <button
          className="h-12 w-full rounded-lg border border-dashed text-[10px] text-zinc-400 hover:bg-zinc-50"
          onClick={() => onAddAvail(cellStart.toISOString())}
        >
          + Khả dụng
        </button>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((it, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${
                it.type === "call"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-zinc-100"
              }`}
            >
              {it.type === "call" ? (
                <Video className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}{" "}
              {it.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
