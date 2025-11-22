import React, { useState } from "react";
import IconBtn from "../../components/doctor/IconBtn";
import { addDaysISO, toLocalInputValue, fmtDateTime } from "../../lib/date";
import { CalendarClock, Plus } from "lucide-react";

export default function SettingsView({ availability, onAddAvail }) {
  const [slot, setSlot] = useState(
    toLocalInputValue(addDaysISO(0, new Date().getHours() + 2))
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Thời gian làm việc / khả dụng
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availability.map((a) => (
            <span
              key={a}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs"
            >
              {fmtDateTime(a)}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="h-10 w-64 rounded-xl border border-zinc-200 px-3 text-sm"
          />
          <IconBtn
            icon={Plus}
            className="bg-zinc-900 text-white"
            onClick={() => onAddAvail(slot)}
          >
            Thêm
          </IconBtn>
        </div>
      </div>
    </div>
  );
}
