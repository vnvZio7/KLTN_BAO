// src/views/HomeworkView.jsx
import React, { useState } from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import { Plus, Check } from "lucide-react";
import { fmtDateTime } from "../../lib/date";

export default function HomeworkView({ patients, onMark, onAssignOpen }) {
  const all = patients.flatMap((p) =>
    p.assignments.map((a) => ({ ...a, patientId: p.id, patientName: p.name }))
  );
  const [q, setQ] = useState("");
  const filtered = all.filter(
    (a) =>
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.patientName.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm bài tập hoặc bệnh nhân"
            className="h-10 w-72 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
          />
        </div>
        <IconBtn icon={Plus} onClick={onAssignOpen}>
          Giao bài mới
        </IconBtn>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <Empty title="Không có bài tập" />}
        {filtered.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-2xl border bg-white p-3"
          >
            <Avatar name={a.patientName} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{a.title}</div>
              <div className="truncate text-xs text-zinc-500">
                {a.patientName} • Hạn: {fmtDateTime(a.due)}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge
                tone={
                  a.status === "đã duyệt"
                    ? "success"
                    : a.status === "nộp bài"
                    ? "info"
                    : "warn"
                }
              >
                {a.status}
              </Badge>
              {a.status !== "đã duyệt" && (
                <IconBtn
                  icon={Check}
                  onClick={() =>
                    onMark({
                      patientId: a.patientId,
                      assignmentId: a.id,
                      status: "đã duyệt",
                    })
                  }
                >
                  Duyệt
                </IconBtn>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
