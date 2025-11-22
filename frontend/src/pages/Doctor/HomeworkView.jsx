import React from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import { fmtDateTime } from "../../lib/date";
import { ClipboardList, FileText, NotebookPen } from "lucide-react";

export default function HomeworkView({ patients, onRespond, onAssign }) {
  const allAssignments = patients.flatMap((p) =>
    p.assignments.map((a) => ({
      ...a,
      patientName: p.name,
      patientId: p.id,
    }))
  );

  const pending = allAssignments.filter((a) => a.submission && !a.feedback);
  const overdue = allAssignments.filter(
    (a) => !a.submission && new Date(a.due) < new Date()
  );
  const completed = allAssignments.filter((a) => a.feedback);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Bài tập</h2>
        <IconBtn icon={NotebookPen} onClick={onAssign}>
          Giao bài mới
        </IconBtn>
      </div>

      {/* Tabs */}
      <Section title="Cần phản hồi" icon={ClipboardList}>
        {pending.length === 0 ? (
          <Empty icon={ClipboardList} title="Không có bài cần phản hồi" />
        ) : (
          pending.map((a) => (
            <ExerciseItem key={a.id} a={a}>
              <IconBtn icon={FileText} onClick={() => onRespond(a)}>
                Xem bài
              </IconBtn>
            </ExerciseItem>
          ))
        )}
      </Section>

      <Section title="Trễ hạn" icon={ClipboardList}>
        {overdue.length === 0 ? (
          <Empty icon={ClipboardList} title="Không có bài trễ hạn" />
        ) : (
          overdue.map((a) => (
            <ExerciseItem key={a.id} a={a}>
              <IconBtn icon={NotebookPen}>Nhắc nhở</IconBtn>
            </ExerciseItem>
          ))
        )}
      </Section>

      <Section title="Đã hoàn thành" icon={ClipboardList}>
        {completed.length === 0 ? (
          <Empty icon={ClipboardList} title="Chưa có bài hoàn thành" />
        ) : (
          completed.map((a) => (
            <ExerciseItem key={a.id} a={a}>
              <IconBtn icon={FileText}>Xem</IconBtn>
            </ExerciseItem>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ExerciseItem({ a, children }) {
  return (
    <div className="rounded-xl border p-3 flex gap-3 items-start">
      <Avatar name={a.patientName} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{a.title}</div>
        <div className="text-xs text-zinc-500">
          BN: {a.patientName} • Hạn: {fmtDateTime(a.due)}
        </div>

        {a.submission && (
          <div className="mt-1 rounded-md border bg-zinc-50 p-2 text-xs">
            <span className="font-medium">Nộp: </span>
            {fmtDateTime(a.submission.submittedAt)}
          </div>
        )}
      </div>

      <div className="flex gap-2">{children}</div>
    </div>
  );
}
