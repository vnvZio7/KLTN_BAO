// Rút gọn logic cho phù hợp module hóa (nhưng đầy đủ chức năng chính)

import React, { useState, useMemo } from "react";
import Avatar from "../../components/doctor/Avatar";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Progress from "../../components/doctor/Progress";
import { fmtDateTime } from "../../lib/date";
import { classifyPHQ9, classifyGAD7, toneToClass } from "../../lib/tests";
import {
  Search,
  ClipboardList,
  Pencil,
  FileText,
  NotebookPen,
  PhoneCall,
} from "lucide-react";

export default function PatientsView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onAssign,
  onSchedule,
}) {
  const active = useMemo(
    () => patients.find((p) => p.id === activePatientId) || patients[0],
    [patients, activePatientId]
  );

  const [dropdown, setDropdown] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [query, patients]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 justify-end">
        <IconBtn icon={NotebookPen} onClick={onAssign}>
          Giao bài tập
        </IconBtn>
        <IconBtn icon={PhoneCall} onClick={onSchedule}>
          Lên lịch
        </IconBtn>

        {/* Patient selector */}
        <div className="relative">
          <button
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2"
            onClick={() => setDropdown(!dropdown)}
          >
            <Avatar name={active.name} size={30} />
            <div>
              <div className="font-semibold text-sm">{active.name}</div>
              <div className="text-xs text-zinc-500">
                {active.gender} • {active.age}t
              </div>
            </div>
          </button>

          {dropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-lg z-20 max-h-[70vh] overflow-auto">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo tên/tag"
                    className="h-10 w-full pl-9 pr-3 rounded-lg border text-sm"
                  />
                </div>
              </div>

              <div>
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePatientId(p.id);
                      setDropdown(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-zinc-50"
                  >
                    <Avatar name={p.name} size={28} />
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-zinc-500">
                        {(p.tags || []).join(", ")}
                      </div>
                    </div>
                    {p.unread > 0 && <Badge tone="info">{p.unread}</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {!active ? (
        <Empty icon={ClipboardList} title="Chưa chọn bệnh nhân" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tests */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="text-sm font-semibold mb-3">Kết quả test</h3>
            <div>
              <Progress
                value={active.latestTests.PHQ9}
                max={27}
                label="PHQ-9"
              />
              <div
                className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                  classifyPHQ9(active.latestTests.PHQ9).tone
                )}`}
              >
                {classifyPHQ9(active.latestTests.PHQ9).label}
              </div>
            </div>

            <div className="mt-4">
              <Progress
                value={active.latestTests.GAD7}
                max={21}
                label="GAD-7"
              />
              <div
                className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                  classifyGAD7(active.latestTests.GAD7).tone
                )}`}
              >
                {classifyGAD7(active.latestTests.GAD7).label}
              </div>
            </div>
          </div>

          {/* Homework list */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Bài tập</h3>
              <IconBtn icon={NotebookPen} onClick={onAssign}>
                Giao
              </IconBtn>
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {active.assignments.length === 0 && (
                <Empty icon={ClipboardList} title="Chưa có bài tập" />
              )}

              {active.assignments.map((a) => {
                const submitted = a.submission?.submittedAt;
                return (
                  <div key={a.id} className="p-3 rounded-xl border flex gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{a.title}</div>
                      <div className="text-xs text-zinc-500">
                        Hạn: {fmtDateTime(a.due)}
                      </div>

                      {submitted && (
                        <div className="mt-1 rounded-md border bg-zinc-50 p-2 text-xs">
                          <span className="font-medium">Nộp: </span>
                          {fmtDateTime(a.submission.submittedAt)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 items-start">
                      {submitted ? (
                        <>
                          <IconBtn icon={FileText}>Xem</IconBtn>
                          <IconBtn icon={NotebookPen}>Phản hồi</IconBtn>
                        </>
                      ) : (
                        <IconBtn icon={Pencil}>Sửa</IconBtn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-white p-4">
              <h3 className="text-sm font-semibold mb-2">Ghi chú</h3>
              <textarea
                className="w-full h-28 rounded-xl border p-3 text-sm"
                defaultValue={active.notes}
                onBlur={(e) =>
                  setPatients((ps) =>
                    ps.map((p) =>
                      p.id === active.id ? { ...p, notes: e.target.value } : p
                    )
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
