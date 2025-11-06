import React, { useMemo, useState } from "react";
import { MOCK_HOMEWORK } from "../../utils/data";

// Nếu bạn chưa có prettyTime, dùng tạm formatter này:
const prettyTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

function Badge({ status }) {
  const map = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    submitted: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    graded: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  const label =
    status === "pending"
      ? "Chưa nộp"
      : status === "submitted"
      ? "Đã nộp"
      : "Đã chấm";
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${map[status]}`}>
      {label}
    </span>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DoctorHomeworkPage({ homework, setHomework }) {
  const [items, setItems] = useState(
    homework && homework.length ? homework : MOCK_HOMEWORK
  );
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);

  const open = (it) => {
    setActive(it);
    setNote("");
    setFiles([]);
  };
  const onFileChange = (e) =>
    setFiles(
      Array.from(e.target.files || []).map((f) => ({
        name: f.name,
        size: f.size,
      }))
    );

  const submit = () => {
    if (!active) return;
    const sub = {
      id: Math.random().toString(36).slice(2),
      time: new Date().toISOString(),
      note,
      files,
    };
    const next = items.map((it) =>
      it.id === active.id
        ? {
            ...it,
            status: "submitted",
            submissions: [sub, ...(it.submissions || [])],
          }
        : it
    );
    setItems(next);
    setHomework?.(next);
    setActive(null);
  };

  const stats = useMemo(() => {
    const total = items.length;
    const submitted = items.filter((x) => x.status !== "pending").length;
    const graded = items.filter((x) => x.status === "graded").length;
    return { total, submitted, graded };
  }, [items]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Bài tập về nhà</h2>
          <p className="text-slate-600 text-sm">
            Xem hướng dẫn và nộp bài trực tuyến.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 px-3 py-2">
            Tổng: <b>{stats.total}</b>
          </div>
          <div className="rounded-xl border border-slate-200 px-3 py-2">
            Đã nộp: <b>{stats.submitted}</b>
          </div>
          <div className="rounded-xl border border-slate-200 px-3 py-2">
            Đã chấm: <b>{stats.graded}</b>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-5">Bài tập</div>
          <div className="col-span-2">Hạn nộp</div>
          <div className="col-span-3">Tài liệu</div>
          <div className="col-span-2 text-right">Trạng thái</div>
        </div>
        <div className="divide-y">
          {items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-12 px-4 py-3 items-center"
            >
              <div className="col-span-5">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-slate-600 line-clamp-1">
                  {it.description}
                </div>
              </div>
              <div className="col-span-2 text-sm">
                {new Date(it.due).toLocaleDateString("vi-VN")}
              </div>
              <div className="col-span-3 flex flex-wrap gap-2 text-sm">
                {it.attachments?.length ? (
                  it.attachments.map((a) => (
                    <a
                      key={a}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="underline text-indigo-600 hover:text-indigo-700"
                    >
                      {a}
                    </a>
                  ))
                ) : (
                  <span className="text-slate-500">Không có</span>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Badge status={it.status} />
                <button
                  onClick={() => open(it)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm"
                >
                  Mở
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title || ""}
      >
        {active && (
          <div className="space-y-4">
            <div className="text-slate-700 text-sm">{active.description}</div>
            <div className="text-sm">
              <span className="text-slate-600">Hạn nộp: </span>
              <b>{new Date(active.due).toLocaleDateString("vi-VN")}</b>
            </div>

            {active.submissions?.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-3">
                <div className="font-medium mb-2 text-sm">Lần nộp gần đây</div>
                {active.submissions.map((s) => (
                  <div
                    key={s.id}
                    className="text-sm flex items-start justify-between gap-3 py-1"
                  >
                    <div>
                      <div className="text-slate-700">
                        {s.note || "(Không có ghi chú)"}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {prettyTime(s.time)}
                      </div>
                      {s.files?.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 text-slate-600">
                          {s.files.map((f, i) => (
                            <li key={i}>
                              {f.name}{" "}
                              <span className="text-xs text-slate-400">
                                ({Math.round((f.size || 0) / 1024)} KB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge status={active.status} />
                  </div>
                ))}
              </div>
            )}

            <div className="border border-slate-200 rounded-xl p-3">
              <div className="font-medium mb-2 text-sm">Nộp bài</div>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[100px] text-sm"
                placeholder="Ghi chú cho bác sĩ hoặc liên kết Google Drive"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  onChange={onFileChange}
                  className="text-sm"
                />
                <span className="text-xs text-slate-500">
                  Hỗ trợ: PDF, DOCX, XLSX, JPG, PNG
                </span>
              </div>
              {files.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-slate-600 text-sm">
                  {files.map((f, i) => (
                    <li key={i}>
                      {f.name}{" "}
                      <span className="text-xs text-slate-400">
                        ({Math.round((f.size || 0) / 1024)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setActive(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={submit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
