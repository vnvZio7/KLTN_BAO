import React, { useMemo, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";
import { API_PATHS } from "../../../../utils/apiPaths";
import { dateFormat, prettyTime } from "../../../../utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightIcon, ChevronRightIcon, MoveRightIcon } from "lucide-react";

export default function NotificationsPage({
  notifications,
  setNotifications,
  user,
}) {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const filtered = useMemo(() => {
    return notifications.filter((n) =>
      filter === "all" ? true : n.type === filter
    );
  }, [notifications, filter]);

  const markAllRead = async () => {
    await axiosInstance.patch(API_PATHS.NOTIFY.UPDATE_MARK_ALL_READ);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id) => {
    await axiosInstance.patch(API_PATHS.NOTIFY.UPDATE_MARK_READ_ONE(id));
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
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
            <option value="call">Lịch hẹn</option>
            <option value="homework">Bài tập về nhà</option>
            <option value="system">Hệ thống</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
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
          <div key={n._id} className="p-4 flex items-start gap-3">
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
                    {n.type === "call"
                      ? "Lịch hẹn"
                      : n.type === "homework"
                      ? "Bài tập về nhà"
                      : "Hệ thống"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {prettyTime(n.createdAt)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-slate-700 mt-1 text-sm">{n.message}</div>
                {n.type === "test" && user.retest === true && (
                  <button
                    onClick={async () => {
                      markOne(n._id);
                      navigate("/retest");
                    }}
                    className="bg-blue-700 px-3 py-1 text-white border-white rounded-2xl hover:bg-blue-600 text-sm flex items-center justify-center"
                  >
                    <span>Bắt đầu làm</span>
                  </button>
                )}
              </div>
              {!n.read && n.type !== "test" && (
                <button
                  onClick={() => markOne(n._id)}
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
