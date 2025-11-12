// src/views/SettingsView.jsx
import React, { useState } from "react";
import IconBtn from "../../components/doctor/IconBtn";
import { Plus } from "lucide-react";
import {
  fmtDateTime,
  toLocalInputValue,
  fromLocalInputValue,
} from "../../lib/date";

export default function SettingsView({ availability, onAddAvail }) {
  const [slot, setSlot] = useState(
    toLocalInputValue(new Date(Date.now() + 2 * 3600 * 1000).toISOString())
  );
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-sm font-semibold">
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
            className="h-10 w-64 rounded-xl border border-zinc-200 px-3 text-sm outline-none"
          />
          <IconBtn
            icon={Plus}
            onClick={() => onAddAvail(fromLocalInputValue(slot))}
          >
            Thêm khung giờ
          </IconBtn>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-semibold">Cài đặt phòng video</div>
        <div className="text-xs text-zinc-500">
          Tích hợp WebRTC/WebSocket ở backend. Ở demo này là placeholder.
        </div>
      </div>
    </div>
  );
}
