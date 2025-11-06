import React, { useMemo, useState } from "react";

export default function NotificationsPage({ notifications, setNotifications }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return notifications.filter((n) =>
      filter === "all" ? true : n.type === filter
    );
  }, [notifications, filter]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  const addMock = (type = "system") => {
    const id = Math.random().toString(36).slice(2);
    const titleMap = {
      appointment: "Lịch hẹn sắp diễn ra",
      message: "Bạn có tin nhắn mới từ bác sĩ",
      system: "Cập nhật hệ thống",
    };
    const bodyMap = {
      appointment: "Nhắc: hẹn video lúc 14:00 hôm nay.",
      message: 'Bác sĩ Minh: "Hẹn bạn 16:00 mai nhé."',
      system: "Tính năng Thông báo đã được nâng cấp.",
    };
    const newItem = {
      id,
      type,
      title: titleMap[type],
      body: bodyMap[type],
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">Bộ lọc:</span>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="appointment">Lịch hẹn</option>
            <option value="message">Tin nhắn</option>
            <option value="system">Hệ thống</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addMock("appointment")}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm"
          >
            Giả lập (Lịch hẹn)
          </button>
          <button
            onClick={() => addMock("message")}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm"
          >
            Giả lập (Tin nhắn)
          </button>
          <button
            onClick={() => addMock("system")}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm"
          >
            Giả lập (Hệ thống)
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            Đọc tất cả
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y">
        {filtered.length === 0 && (
          <div className="p-6 text-slate-500">Không có thông báo.</div>
        )}
        {filtered.map((n) => (
          <div key={n.id} className="p-4 flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                n.read ? "bg-slate-300" : "bg-red-500"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {n.title}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-slate-300 text-slate-600">
                    {n.type === "appointment"
                      ? "Lịch hẹn"
                      : n.type === "message"
                      ? "Tin nhắn"
                      : "Hệ thống"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(n.time).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="text-slate-700 mt-1 text-sm">{n.body}</div>
              {!n.read && (
                <button
                  onClick={() => markOne(n.id)}
                  className="mt-2 text-xs px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
