// src/views/CallsView.jsx
import React from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import { Video, Plus, X } from "lucide-react";
import { fmtDateTime } from "../../lib/date";
import { nameOf } from "../../lib/utils";

export default function CallsView({ calls, setCalls, patients, onNew }) {
  const remove = (id) => setCalls((cs) => cs.filter((c) => c.id !== id));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconBtn icon={Plus} onClick={onNew}>
          Tạo lịch gọi
        </IconBtn>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {calls.length === 0 && <Empty title="Chưa có lịch gọi" />}
        {calls.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border bg-white p-3"
          >
            <Avatar name={nameOf(patients, c.patientId)} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {nameOf(patients, c.patientId)}
              </div>
              <div className="text-xs text-zinc-500">
                {fmtDateTime(c.time)} • 45 phút • {c.status}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <IconBtn icon={Video}>Vào phòng</IconBtn>
              <IconBtn
                icon={X}
                className="text-rose-600"
                onClick={() => remove(c.id)}
              >
                Hủy
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
