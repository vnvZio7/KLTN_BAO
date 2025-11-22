// DemoDoctorAppointmentsOnly.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useUserContext } from "../../../../context/userContext";
import axiosInstance from "../../../../utils/axiosInstance";
import { API_PATHS } from "../../../../utils/apiPaths";

/** Utils: format ISO datetime to Vietnamese readable string */
function prettyTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * SchedulePage — chỉ hiển thị danh sách lịch hẹn với bác sĩ hiện tại
 * - Không có form đặt lịch, không có nút huỷ
 * - Nếu status = "upcoming" → hiện nút "Vào phòng"
 * - Nếu status = "completed"/"complete" → hiện nút "Xem lại"
 */
export default function SchedulePage({
  doctor,
  appointments,
  onJoinRoom, // callback khi bấm "Vào phòng"
  onReview, // callback khi bấm "Xem lại" (replay/notes)
}) {
  const joinRoom = (appt) => {
    onJoinRoom?.(appt);
    if (!onJoinRoom) alert("Đi vào phòng gọi… (TODO: kết nối WebRTC)");
  };

  const reviewAppt = (appt) => {
    onReview?.(appt);
    if (!onReview) alert("Xem lại cuộc hẹn… (TODO: mở ghi âm/ghi chú)");
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-1">
          Lịch đã đặt với {doctor?.accountId.fullName || "bác sĩ"}
        </h3>
        <p className="text-slate-600 mb-4">
          Hệ thống sẽ nhắc trước 15 phút. Mỗi lịch kéo dài <b>45 phút</b>.
        </p>

        <div className="divide-y">
          {appointments.length === 0 && (
            <div className="text-slate-500">
              Chưa có lịch hẹn nào với {doctor?.accountId.fullName || "bác sĩ"}.
            </div>
          )}

          {appointments.map((a) => {
            const isUpcoming = a.status === "upcoming";
            const isCompleted =
              a.status === "completed" || a.status === "complete";

            return (
              <div
                key={a.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{prettyTime(a.time)}</div>
                  <div className="text-sm text-slate-600">
                    {a.reason || "Không có ghi chú"} · {a.durationMinutes || 45}{" "}
                    phút
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isUpcoming
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isCompleted
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {isUpcoming
                      ? "Sắp diễn ra"
                      : isCompleted
                      ? "Hoàn thành"
                      : a.status}
                  </span>

                  {isUpcoming && (
                    <button
                      type="button"
                      onClick={() => joinRoom(a)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Vào phòng
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => reviewAppt(a)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700"
                    >
                      Xem lại
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* --------------------------- DATA MẪU --------------------------- */

/* --------------------------- DEMO WRAPPER --------------------------- */
// export default function DemoDoctorAppointmentsOnly() {
//   return (
//     <div className="p-6 bg-slate-50 min-h-screen">
//       <SchedulePage
//         // doctor={}
//         // appointments={appointments}
//         onJoinRoom={(appt) => {
//           console.log("Join room:", appt);
//           alert(`Vào phòng: ${appt.id}`);
//         }}
//         onReview={(appt) => {
//           console.log("Review appointment:", appt);
//           alert(`Xem lại: ${appt.id}`);
//         }}
//       />
//     </div>
//   );
// }
