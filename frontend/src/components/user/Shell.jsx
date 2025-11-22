import React from "react";

export default function Shell({
  active,
  onChange,
  user,
  unreadChat,
  unreadNotif,
  children,
  onLogout,
}) {
  const NAV = [
    { key: "stats", label: "Thống kê" }, // ← thêm mục Thống kê
    { key: "doctor", label: "Thông tin bác sĩ" },
    { key: "homework", label: "Bài tập về nhà" },

    { key: "schedule", label: "Hẹn lịch video" },
    { key: "chat", label: "Nhắn tin", badge: unreadChat },
    { key: "notifications", label: "Thông báo", badge: unreadNotif },
    { key: "profile", label: "Thông tin cá nhân" },
    { key: "billing", label: "Thanh toán" },
  ];
  const initials = (name = "U") =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-content-center font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Sức Khỏe Tâm Lý
              </h1>
              <p className="text-xs text-slate-500">Cổng người dùng</p>
            </div>
          </div>
          {/* Thông tin người dùng + menu hover Đăng xuất */}
          <div className="relative group inline-block">
            <div className="flex items-center gap-3 cursor-default select-none">
              <div
                className="h-9 w-9 rounded-full bg-slate-800 text-white
                      grid place-content-center text-xs font-semibold"
              >
                {initials(user?.accountId.fullName)}
              </div>
              <div className="text-sm">
                <div className="font-medium">
                  {user?.accountId.fullName || "Người dùng"}
                </div>
                <div className="text-slate-600">{user?.accountId.email}</div>
              </div>
            </div>

            {/* Dropdown khi hover */}
            <div
              className="absolute right-0 mt-0 w-40 bg-white border border-slate-200
                  rounded-xl shadow-lg opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto transition"
            >
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-12 gap-6 py-6">
        <aside className="md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
            {NAV.map((item) => (
              <div key={item.key} className="relative">
                <button
                  onClick={() => onChange(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    active === item.key
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
                {item.badge > 0 && (
                  <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-9 lg:col-span-10">{children}</main>
      </div>
    </div>
  );
}
