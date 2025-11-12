// src/views/RequestsView.jsx
import React, { useState } from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import { CalendarClock, Check, Plus, X } from "lucide-react";
import {
  fmtDateTime,
  toLocalInputValue,
  fromLocalInputValue,
} from "../../lib/date";
import { nameOf } from "../../lib/utils";

export default function RequestsView({
  requests,
  patients,
  onAccept,
  onDecline,
  availability,
  onAddAvail,
}) {
  const [newAvail, setNewAvail] = useState(
    toLocalInputValue(new Date(Date.now() + 3 * 3600 * 1000).toISOString())
  );
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Yêu cầu chờ xử lý</h3>
          <Badge tone="info">
            {requests.filter((r) => r.status === "pending").length} yêu cầu
          </Badge>
        </div>
        <div className="space-y-3">
          {requests.length === 0 && (
            <Empty icon={CalendarClock} title="Không có yêu cầu" />
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={nameOf(patients, r.patientId)} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {nameOf(patients, r.patientId)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Ưu tiên: {fmtDateTime(r.preferred)} • {r.note}
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <IconBtn
                  icon={Check}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onAccept(r.id)}
                >
                  Chấp nhận
                </IconBtn>
                <IconBtn
                  icon={X}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                  onClick={() => onDecline(r.id)}
                >
                  Từ chối
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-sm font-semibold">Khung giờ khả dụng</div>
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
            value={newAvail}
            onChange={(e) => setNewAvail(e.target.value)}
            className="h-10 w-60 rounded-xl border border-zinc-200 px-3 text-sm outline-none"
          />
          <IconBtn
            icon={Plus}
            onClick={() => onAddAvail(fromLocalInputValue(newAvail))}
          >
            Thêm
          </IconBtn>
        </div>
      </div>
    </div>
  );
}
