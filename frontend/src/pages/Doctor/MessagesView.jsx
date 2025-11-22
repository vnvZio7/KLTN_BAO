import React, { useState, useEffect } from "react";
import Avatar from "../../components/doctor/Avatar";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import { fmtTime } from "../../lib/date";
import { CheckCircle2, MessageSquareText } from "lucide-react";

export default function MessagesView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onSend,
}) {
  const [text, setText] = useState("");
  const active = patients.find((p) => p.id === activePatientId) || patients[0];
  const msgs = active.messages || [];

  useEffect(() => {
    setPatients((ps) =>
      ps.map((p) => (p.id === active.id ? { ...p, unread: 0 } : p))
    );
  }, [active.id, setPatients]);

  const isCompleted = active.chatStatus === "completed";

  const handleComplete = () => {
    if (!window.confirm("Đánh dấu hoàn thành trị liệu?")) return;

    setPatients((ps) =>
      ps.map((p) =>
        p.id === active.id
          ? {
              ...p,
              chatStatus: "completed",
              messages: [
                ...p.messages,
                {
                  id: Math.random().toString(36),
                  sender: "system",
                  text: "Bác sĩ đã hoàn thành khóa trị liệu.",
                  at: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sidebar */}
      <div>
        <div className="text-sm font-semibold mb-2">Cuộc hội thoại</div>
        <div className="space-y-2">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePatientId(p.id)}
              className={`flex items-center gap-3 w-full border rounded-xl p-3 ${
                active.id === p.id ? "border-zinc-900" : ""
              }`}
            >
              <Avatar name={p.name} size={32} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {p.messages[p.messages.length - 1]?.text || "—"}
                </div>
              </div>
              {p.unread > 0 && <Badge tone="info">{p.unread}</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="lg:col-span-2 rounded-xl border bg-white flex flex-col">
        <div className="border-b p-4 flex items-center gap-3">
          <Avatar name={active.name} />
          <div className="text-sm font-semibold">{active.name}</div>
          {isCompleted ? (
            <Badge>Đã hoàn thành</Badge>
          ) : (
            <Badge tone="success">Trực tuyến</Badge>
          )}

          {!isCompleted && (
            <IconBtn
              icon={CheckCircle2}
              className="ml-auto bg-emerald-600 text-white"
              onClick={handleComplete}
            >
              Hoàn thành
            </IconBtn>
          )}
        </div>

        <div className="p-4 overflow-auto h-[55vh]">
          {msgs.length === 0 ? (
            <Empty icon={MessageSquareText} title="Chưa có tin nhắn" />
          ) : (
            msgs.map((m) => (
              <div
                key={m.id}
                className={`flex mb-2 ${
                  m.sender === "doctor" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[70%] ${
                    m.sender === "doctor"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="text-[10px] opacity-60 mt-1">
                    {fmtTime(m.at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isCompleted && (
          <form
            className="border-t p-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onSend({ patientId: active.id, text });
              setText("");
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border rounded-xl px-3 h-11"
              placeholder="Nhập tin nhắn…"
            />
            <IconBtn
              icon={MessageSquareText}
              className="bg-zinc-900 text-white"
            >
              Gửi
            </IconBtn>
          </form>
        )}
      </div>
    </div>
  );
}
