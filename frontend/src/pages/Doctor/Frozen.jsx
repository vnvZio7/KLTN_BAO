// src/pages/Frozen.jsx
import React from "react";
import { AlertTriangle, Lock, Mail, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Frozen() {
  const navigate = useNavigate();

  // Nếu muốn, bạn có thể truyền lý do/ thời gian từ backend qua props hoặc context
  const reason =
    "Hệ thống phát hiện một số hoạt động bất thường hoặc vi phạm điều khoản sử dụng.";
  const until = null; // ví dụ: "23:59 ngày 20/12/2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-600 to-blue-400 flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-3xl border border-slate-700 bg-slate-900/80 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl p-6 sm:p-8 text-slate-100 relative overflow-hidden">
        {/* Vòng tròn glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/40">
            <AlertTriangle className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/90">
              Cảnh báo hệ thống
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold mt-1">
              Tài khoản của bạn đang bị đóng băng
            </h1>
          </div>
        </div>

        {/* Card nội dung */}
        <div className="relative mt-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-600">
              <Lock className="w-5 h-5 text-slate-100" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-100 font-medium">
                Vì sao tài khoản bị đóng băng?
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{reason}</p>
              {until && (
                <p className="text-xs text-slate-400 mt-1">
                  Thời gian đóng băng dự kiến đến:{" "}
                  <span className="font-semibold text-slate-100">{until}</span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs sm:text-sm text-slate-300 space-y-2">
            <p className="font-medium text-slate-100">
              Trong thời gian này, bạn sẽ:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Không thể đặt hoặc tham gia lịch hẹn mới.</li>
              <li>Không thể nhắn tin hoặc gọi video trong hệ thống.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs sm:text-sm text-amber-100">
            <p className="font-medium mb-1">Nếu bạn nghĩ đây là nhầm lẫn</p>
            <p>
              Vui lòng liên hệ đội ngũ hỗ trợ để được kiểm tra và mở lại tài
              khoản (nếu đủ điều kiện).
            </p>
          </div>
        </div>

        {/* Hành động */}
        <div className="relative mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              // ví dụ: mở modal hỗ trợ hoặc link mail
              window.location.href =
                "mailto:support@pomera.vn?subject=Yeu%20cau%20xem%20xet%20tai%20khoan";
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-red-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-red-500/30 hover:brightness-110 transition"
          >
            <Mail className="w-4 h-4" />
            Liên hệ hỗ trợ
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>

        {/* Footnote nhỏ */}
        <p className="relative mt-4 text-[11px] text-white text-center">
          Nếu bạn đã gửi yêu cầu xem xét, vui lòng chờ 1–2 ngày làm việc để đội
          ngũ hỗ trợ phản hồi.
        </p>
      </div>
    </div>
  );
}
