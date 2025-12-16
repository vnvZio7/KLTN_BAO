import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { prettyTime } from "../../../../utils/helper";
import { INITIAL_MESSAGES } from "../../../../utils/data";
import { useUserContext } from "../../../../context/userContext";

export default function ChatPage({
  room,
  doctor,
  messages,
  setMessages,
  onSend,
  onComplete, // optional: callback khi đánh dấu hoàn thành
  onSendComplete, // optional: callback gửi yêu cầu hoàn thành tới bác sĩ/backend
  onlineUsers,
}) {
  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);
  const listRef = useRef(null);
  const { subcribeToMessages, unSubcribeToMessages } = useUserContext();
  useEffect(() => {
    if (!room?._id) return;
    subcribeToMessages(room._id);
    return () => unSubcribeToMessages();
  }, [room?._id, subcribeToMessages, unSubcribeToMessages]);
  console.log(messages);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onSend({ roomId: room._id, content: text });
      setText("");
    } catch (error) {
      console.error("Failed to send message: ", error);
    }
    // setMessages((prev) => [...prev, me]);
    // setText("");
    // setTimeout(() => {
    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       id: Math.random().toString(36).slice(2),
    //       from: "doctor",
    //       text: "Mình đã nhận tin. Bạn thử thở 4-7-8 5 phút nhé!",
    //       time: new Date().toISOString(),
    //     },
    //   ]);
    //   setUnreadChat?.((c) => (typeof c === "number" ? c + 1 : c));
    // }, 900);
  };

  const handleComplete = async () => {
    const ok = window.confirm(
      "Bạn có chắc chắn muốn hoàn thành khóa điều trị này không?"
    );
    if (!ok) return;

    // 3) Gửi callback lên parent/backend nếu cần
    try {
      // 1) Ẩn nút
      setCompleted(true);

      // 2) Thêm system message để cả hai phía đều thấy lịch sử yêu cầu
      const sysMsg = {
        id: Math.random().toString(36).slice(2),
        senderType: "system",
        content:
          "Bạn đã đánh dấu HOÀN THÀNH khóa điều trị. Yêu cầu đã được gửi tới bác sĩ.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, sysMsg]);
      await onSendComplete?.({
        doctorId: doctor?.id,
        at: new Date().toISOString(),
        type: "chat_completed_request",
      });
      // thông báo badge/unread cho phía bác sĩ (tuỳ ý)
    } catch (e) {
      // Nếu lỗi gửi backend, vẫn giữ trạng thái completed & message
      console.error("Send complete request failed:", e);
    }

    // 4) Callback hoàn thành cho parent (tuỳ chọn)
    onComplete?.();
  };

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 h-[72vh] flex flex-col">
      {/* Nút Hoàn thành (ẩn sau khi đã hoàn thành) */}
      {!completed && (
        <button
          onClick={handleComplete}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-white shadow-sm"
          aria-label="Đánh dấu hoàn thành"
          title="Đánh dấu hoàn thành"
        >
          <CheckCircle2 className="h-4 w-4" />
          Hoàn thành
        </button>
      )}

      {/* Header chat có ảnh bác sĩ */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <img
          src={doctor.avatar}
          alt={doctor.accountId.fullName}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <div className="font-medium">{doctor.accountId.fullName}</div>
          {onlineUsers.onlineUsers.includes(doctor._id) ? (
            <div className="text-xs text-green-700">● Online</div>
          ) : (
            <div className="text-xs text-gray-500">● Offline</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"
      >
        {messages.map((m) => {
          if (m.senderType === "system") {
            return (
              <div
                key={m._id}
                className="mx-auto max-w-[80%] text-center text-xs text-slate-600"
              >
                <div className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                  {m.content}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {prettyTime(m.createdAt)}
                </div>
              </div>
            );
          }
          return (
            <div
              key={m._id}
              className={`max-w-[65%] rounded-2xl px-4 py-2 shadow-sm ${
                m.senderType === "user"
                  ? "ml-auto bg-indigo-600 text-white"
                  : "mr-auto bg-white border border-slate-200"
              }`}
            >
              <div className="text-sm leading-relaxed">{m.content}</div>
              <div
                className={`mt-1 text-[11px] ${
                  m.senderType === "user" ? "text-indigo-100" : "text-slate-500"
                }`}
              >
                {prettyTime(m.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-slate-200 flex items-center gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Nhập tin nhắn…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(e)}
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
