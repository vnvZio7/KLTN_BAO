// src/components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const SIGNALING_SERVER = "http://localhost:8080";

export default function Chat({ roomId }) {
  const [socket, setSocket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const msgsRef = useRef([]);

  useEffect(() => {
    const s = io(SIGNALING_SERVER);
    setSocket(s);
    s.on("connect", () => s.emit("join-room", roomId));
    s.on("chat-message", ({ from, message, meta }) => {
      const m = { from, message, meta };
      msgsRef.current = [...msgsRef.current, m];
      setMsgs(msgsRef.current);
    });
    return () => s.disconnect();
  }, [roomId]);

  function send() {
    if (!text.trim() || !socket) return;
    socket.emit("chat-message", {
      roomId,
      message: text,
      meta: { ts: Date.now() },
    });
    setMsgs((prev) => [
      ...prev,
      { from: "me", message: text, meta: { ts: Date.now() } },
    ]);
    setText("");
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="font-semibold mb-2">Chat</h2>
      <div className="h-64 overflow-auto border p-2 mb-3 bg-gray-50">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.from === "me" ? "text-right" : ""}`}
          >
            <div className="text-sm text-gray-500">
              {m.from === "me" ? "You" : m.from}
            </div>
            <div className="inline-block p-2 rounded bg-white shadow">
              {m.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
