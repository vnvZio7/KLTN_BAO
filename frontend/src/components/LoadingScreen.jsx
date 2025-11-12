import React from "react";

/**
 * LoadingScreen - màn hình chờ dùng chung cho toàn app
 * -----------------------------------------------------
 * Props:
 * - message (string): thông báo hiển thị bên dưới spinner
 * - full (boolean): nếu true thì chiếm toàn màn hình
 *
 * Dùng:
 * <LoadingScreen message="Đang tải dữ liệu..." full />
 */
export default function LoadingScreen({
  message = "Đang tải dữ liệu...",
  full = true,
}) {
  return (
    <div
      className={`${
        full ? "fixed inset-0 flex" : "flex"
      } items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 ${
        full ? "z-50" : ""
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-teal-300 border-t-teal-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-teal-600 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Text */}
        <p className="text-gray-700 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
}
