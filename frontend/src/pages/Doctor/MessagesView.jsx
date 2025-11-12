// src/views/MessagesView.jsx
import React, { useEffect, useState } from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import { Video } from "lucide-react";
import { fmtTime } from "../../lib/date";

export default function MessagesView({
  patients,
  setPatients,
  activePatientId,
  setActivePatientId,
  onSend,
}) {
  const [text, setText] = useState("");
  const ap = patients.find((p) => p.id === activePatientId) || patients[0];
  const msgs = ap?.messages || [];

  useEffect(() => {
    setPatients((ps) =>
      ps.map((p) => (p.id === ap?.id ? { ...p, unread: 0 } : p))
    );
  }, [ap?.id, setPatients]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div>
        <div className="mb-2 text-sm font-semibold">Cuộc hội thoại</div>
        <div className="space-y-2">
          {patients.map((p) => (
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
                  {(p.messages || [])[p.messages?.length - 1]?.text || "—"}
                </div>
              </div>
              {p.unread > 0 && <Badge tone="info">{p.unread}</Badge>}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl border bg-white">
        <div className="flex items-center gap-3 border-b p-4">
          <Avatar name={ap?.name} />
          <div className="text-sm font-semibold">{ap?.name}</div>
          <Badge tone="success">Trực tuyến</Badge>
          <div className="ml-auto">
            <IconBtn icon={Video}>Gọi video</IconBtn>
          </div>
        </div>
        <div className="h-[50vh] overflow-auto p-4">
          {msgs.length === 0 ? (
            <Empty title="Chưa có tin nhắn" />
          ) : (
            <div className="space-y-2">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "doctor" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender === "doctor"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="mt-1 text-[10px] opacity-70">
                      {fmtTime(m.at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend({ patientId: ap.id, text });
            setText("");
          }}
          className="flex items-center gap-2 border-t p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn…"
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
          />
          <IconBtn className="border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800">
            Gửi
          </IconBtn>
        </form>
      </div>
    </div>
  );
}
