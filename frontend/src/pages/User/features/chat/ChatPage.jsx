import React, { useEffect, useRef, useState } from "react";
import { prettyTime } from "../../../../utils/helper";
import { INITIAL_MESSAGES } from "../../../../utils/data";

export default function ChatPage({ doctor, setUnreadChat }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    const me = {
      id: Math.random().toString(36).slice(2),
      from: "user",
      text,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, me]);
    setText("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          from: "doctor",
          text: "Mình đã nhận tin. Bạn thử thở 4‑7‑8 5 phút nhé!",
          time: new Date().toISOString(),
        },
      ]);
      setUnreadChat((c) => c + 1);
    }, 900);
  };
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[72vh] flex flex-col">
      {/* Header chat có ảnh bác sĩ */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <img
          src={doctor.avatar}
          alt={doctor.name}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <div className="font-medium">{doctor.name}</div>
          <div className="text-xs text-emerald-700">● Trực tuyến</div>
        </div>
      </div>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
              m.from === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "mr-auto bg-white border border-slate-200"
            }`}
          >
            <div className="text-sm leading-relaxed">{m.text}</div>
            <div
              className={`mt-1 text-[11px] ${
                m.from === "user" ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              {prettyTime(m.time)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-200 flex items-center gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Nhập tin nhắn…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
