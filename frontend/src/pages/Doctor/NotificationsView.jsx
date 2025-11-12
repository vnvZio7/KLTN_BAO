// src/views/NotificationsView.jsx
import React from "react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import { Bell, Check } from "lucide-react";
import { fmtDateTime } from "../../lib/date";

export default function NotificationsView({ notifications, onMarkAll }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Thông báo</div>
        <IconBtn icon={Check} onClick={onMarkAll}>
          Đánh dấu đã đọc
        </IconBtn>
      </div>
      <div className="space-y-2">
        {notifications.length === 0 && (
          <Empty icon={Bell} title="Không có thông báo" />
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              n.read ? "opacity-60" : ""
            }`}
          >
            <div
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                n.type === "success"
                  ? "bg-emerald-600 text-white"
                  : n.type === "warn"
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 text-white"
              }`}
            >
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm">{n.text}</div>
              <div className="text-xs text-zinc-500">{fmtDateTime(n.at)}</div>
            </div>
            {!n.read && <Badge tone="info">Mới</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}
