// src/views/PatientsView.jsx
import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Check,
  NotebookPen,
  PhoneCall,
  MessageSquareText,
  Users,
  ChevronDown,
} from "lucide-react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import Progress from "../../components/doctor/Progress";
import Modal from "../../components/doctor/Modal";

import { classifyPHQ9, classifyGAD7, toneToClass } from "../../lib/tests";
import { toLocalInputValue, fromLocalInputValue } from "../../lib/date";
import { uid } from "../../lib/utils";

// Nếu bạn đã có kho mẫu ở nơi khác, chỉnh lại path dưới đây cho đúng
import { HOMEWORK_TEMPLATES } from "../../mock/data";

export default function PatientsView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onAssign, // sẽ được gọi với payload đầy đủ nếu có truyền từ parent
  onSchedule,
  onMark,
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase()))
      ),
    [patients, q]
  );

  const ap = patients.find((p) => p.id === activePatientId) || filtered[0];

  // Dropdown chọn bệnh nhân (góc phải)
  const [openPatientMenu, setOpenPatientMenu] = useState(false);

  // Modal giao bài tập (2 chế độ: template | custom)
  const [openAssign, setOpenAssign] = useState(false);
  const [assignMode, setAssignMode] = useState("template"); // "template" | "custom"

  // Dữ liệu form khi chọn template
  const [tplCode, setTplCode] = useState(HOMEWORK_TEMPLATES?.[0]?.code || "");
  const tplSelected = HOMEWORK_TEMPLATES.find((t) => t.code === tplCode);

  // Trường chung (chỉnh được cả khi template)
  const [title, setTitle] = useState(tplSelected?.name || "");
  const [content, setContent] = useState(""); // nội dung mô tả bài tập (bác sĩ có thể viết)
  const [difficulty, setDifficulty] = useState("easy"); // easy|medium|hard
  const [frequency, setFrequency] = useState("daily"); // once|daily|weekly
  const [due, setDue] = useState(
    toLocalInputValue(new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString())
  );

  // Đồng bộ khi đổi template
  React.useEffect(() => {
    if (assignMode === "template" && tplSelected) {
      setTitle(tplSelected.name || "");
      // Bạn có thể map mô tả mẫu nếu có (vd: tplSelected.description)
      if (!content) setContent(`Instructions for ${tplSelected.name}...`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tplCode, assignMode]);

  const confirmAssign = () => {
    if (!ap) return;

    const payload = {
      patientId: ap.id,
      source: assignMode, // "template" | "custom"
      templateCode: assignMode === "template" ? tplCode : null,
      title: title?.trim() || "Homework",
      content: content?.trim() || "",
      difficulty, // "easy" | "medium" | "hard"
      frequency, // "once" | "daily" | "weekly"
      due: fromLocalInputValue(due),
    };

    // Nếu parent truyền onAssign thì gọi ra ngoài
    if (typeof onAssign === "function") {
      onAssign(payload);
    } else {
      // Fallback: tự thêm vào state local (demo)
      setPatients((ps) =>
        ps.map((p) =>
          p.id === ap.id
            ? {
                ...p,
                assignments: [
                  {
                    id: uid(),
                    code: payload.templateCode || "CUSTOM",
                    title: payload.title,
                    due: payload.due,
                    status: "chưa làm",
                    difficulty: payload.difficulty,
                    frequency: payload.frequency,
                    content: payload.content,
                  },
                  ...(p.assignments || []),
                ],
              }
            : p
        )
      );
    }

    setOpenAssign(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Cột trái: danh sách bệnh nhân + tìm kiếm */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm bệnh nhân"
              className="h-10 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
            />
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePatientId(p.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50 ${
                ap?.id === p.id ? "border-zinc-900" : "border-zinc-200"
              }`}
            >
              <Avatar name={p.name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="truncate text-xs text-zinc-500">
                  {p.gender} • {p.age}t • {(p.tags || []).join(", ")}
                </div>
              </div>
              {p.unread > 0 && <Badge tone="info">{p.unread} tin mới</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Cột phải: chi tiết + actions */}
      <div className="lg:col-span-2 space-y-4">
        {!ap ? (
          <Empty icon={Users} title="Chưa chọn bệnh nhân" />
        ) : (
          <div className="space-y-4">
            {/* Header thông tin + Actions + Patient dropdown (bên phải) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={ap.name} size={48} />
                <div>
                  <div className="text-base font-semibold">{ap.name}</div>
                  <div className="text-xs text-zinc-500">
                    {ap.gender} • {ap.age}t • {(ap.tags || []).join(" • ")}
                  </div>
                </div>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2 relative">
                {/* Dropdown chọn bệnh nhân bên phải */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => setOpenPatientMenu((v) => !v)}
                >
                  {ap?.name || "Chọn bệnh nhân"}{" "}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {openPatientMenu && (
                  <div
                    className="absolute right-0 top-11 z-20 w-72 max-h-72 overflow-auto rounded-xl border bg-white shadow-lg"
                    onMouseLeave={() => setOpenPatientMenu(false)}
                  >
                    <div className="p-2 text-xs text-zinc-500">
                      Chọn bệnh nhân
                    </div>
                    {patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePatientId(p.id);
                          setOpenPatientMenu(false);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-50 ${
                          ap?.id === p.id ? "bg-zinc-50" : ""
                        }`}
                      >
                        <Avatar name={p.name} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {p.name}
                          </div>
                          <div className="truncate text-[11px] text-zinc-500">
                            {p.gender} • {p.age}t • {(p.tags || []).join(", ")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <IconBtn
                  icon={NotebookPen}
                  onClick={() => {
                    setAssignMode("template");
                    setTplCode(HOMEWORK_TEMPLATES?.[0]?.code || "");
                    setTitle(HOMEWORK_TEMPLATES?.[0]?.name || "");
                    setContent("");
                    setDifficulty("easy");
                    setFrequency("daily");
                    setDue(
                      toLocalInputValue(
                        new Date(
                          Date.now() + 3 * 24 * 3600 * 1000
                        ).toISOString()
                      )
                    );
                    setOpenAssign(true);
                  }}
                >
                  Giao bài tập
                </IconBtn>
                <IconBtn icon={PhoneCall} onClick={onSchedule}>
                  Lên lịch gọi
                </IconBtn>
                <IconBtn
                  icon={MessageSquareText}
                  onClick={() => setActivePatientId(ap.id)}
                >
                  Mở chat
                </IconBtn>
              </div>
            </div>

            {/* Kết quả test + Bài tập + Ghi chú */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Kết quả bài test</h3>
                  <Badge tone="info">PHQ-9 • GAD-7</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Progress
                      value={ap.latestTests?.PHQ9 ?? 0}
                      max={27}
                      label="PHQ-9"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                        classifyPHQ9(ap.latestTests?.PHQ9 ?? 0).tone
                      )}`}
                    >
                      {classifyPHQ9(ap.latestTests?.PHQ9 ?? 0).label}
                    </div>
                  </div>
                  <div>
                    <Progress
                      value={ap.latestTests?.GAD7 ?? 0}
                      max={21}
                      label="GAD-7"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${toneToClass(
                        classifyGAD7(ap.latestTests?.GAD7 ?? 0).tone
                      )}`}
                    >
                      {classifyGAD7(ap.latestTests?.GAD7 ?? 0).label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Bài tập trị liệu</h3>
                  <IconBtn
                    icon={Plus}
                    onClick={() => {
                      setAssignMode("template");
                      setTplCode(HOMEWORK_TEMPLATES?.[0]?.code || "");
                      setTitle(HOMEWORK_TEMPLATES?.[0]?.name || "");
                      setContent("");
                      setDifficulty("easy");
                      setFrequency("daily");
                      setDue(
                        toLocalInputValue(
                          new Date(
                            Date.now() + 3 * 24 * 3600 * 1000
                          ).toISOString()
                        )
                      );
                      setOpenAssign(true);
                    }}
                  >
                    Thêm
                  </IconBtn>
                </div>
                <div className="space-y-2">
                  {ap.assignments.length === 0 && (
                    <Empty title="Chưa có bài tập" />
                  )}
                  {ap.assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white">
                        TR
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {a.title}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Hạn: {new Date(a.due).toLocaleString("vi-VN")}
                          {a.frequency ? ` • ${a.frequency}` : ""}
                          {a.difficulty ? ` • ${a.difficulty}` : ""}
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
                                patientId: ap.id,
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

              <div className="md:col-span-2 rounded-2xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Ghi chú</h3>
                </div>
                <textarea
                  className="h-28 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                  defaultValue={ap.notes}
                  onBlur={(e) =>
                    setPatients((ps) =>
                      ps.map((p) =>
                        p.id === ap.id ? { ...p, notes: e.target.value } : p
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal giao bài tập */}
      <Modal
        open={openAssign}
        title="Giao bài tập trị liệu"
        onClose={() => setOpenAssign(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <IconBtn
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setOpenAssign(false)}
            >
              Hủy
            </IconBtn>
            <IconBtn
              className="border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={confirmAssign}
            >
              Xác nhận
            </IconBtn>
          </div>
        }
      >
        {/* Toggle 2 chế độ */}
        <div className="mb-4 inline-flex rounded-xl border p-1 text-sm">
          <button
            className={`rounded-lg px-3 py-1 ${
              assignMode === "template"
                ? "bg-zinc-900 text-white"
                : "hover:bg-zinc-50"
            }`}
            onClick={() => setAssignMode("template")}
            type="button"
          >
            Dùng mẫu
          </button>
          <button
            className={`rounded-lg px-3 py-1 ${
              assignMode === "custom"
                ? "bg-zinc-900 text-white"
                : "hover:bg-zinc-50"
            }`}
            onClick={() => setAssignMode("custom")}
            type="button"
          >
            Tự tạo
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignMode === "template" && (
            <>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-600">Chọn mẫu</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
                  value={tplCode}
                  onChange={(e) => setTplCode(e.target.value)}
                >
                  {HOMEWORK_TEMPLATES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name} • {t.difficulty} • {t.duration}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Trường sửa/chung */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-600">Tiêu đề</label>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: CBT Thought Record - Ngày 1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-600">
              Nội dung / Hướng dẫn
            </label>
            <textarea
              className="mt-1 h-28 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hướng dẫn chi tiết bệnh nhân cần thực hiện…"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-600">Độ khó</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-600">Tần suất</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="once">once</option>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-600">Hạn nộp</label>
            <input
              type="datetime-local"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
