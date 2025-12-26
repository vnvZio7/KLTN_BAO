// DemoDoctorAppointmentsOnly.jsx
import React from "react";
import VideoCallPopup from "../../../../components/VideoCallPopup";
import { useState } from "react";

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
 * SchedulePage — hiển thị:
 * - Phần trên: cuộc gọi sắp diễn ra (pending & chưa kết thúc)
 * - Phần dưới: lịch sử các cuộc gọi đã diễn ra
 */
export default function SchedulePage({
  doctor,
  appointments = [],
  sessions,
  onReview, // callback khi bấm "Xem lại" (replay/notes)
}) {
  const [openCall, setOpenCall] = useState(false);
  const [callRoomId, setCallRoomId] = useState(null);
  const joinRoom = (appt) => {
    setCallRoomId(appt._id);
    setOpenCall(true);
    // if (!onJoinRoom) alert("Đi vào phòng gọi… (TODO: kết nối WebRTC)");
  };

  const reviewAppt = (appt) => {
    onReview(appt);
  };

  const now = new Date();
  const nowMs = now.getTime();
  const FIFTEEN_MIN_MS = 15 * 60 * 1000;

  // Cuộc gọi sắp diễn ra: status pending & endTime >= now
  const upcoming = React.useMemo(() => {
    return (appointments || [])
      .filter((a) => {
        const end = new Date(a.endTime);
        return a.status === "pending" && end >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }, [appointments, now]);

  // Lịch sử: mọi lịch còn lại (đã kết thúc hoặc đã hoàn thành/hủy)
  const history = React.useMemo(() => {
    return (appointments || [])
      .filter((a) => {
        const end = new Date(a.endTime);
        const isUpcoming = a.status === "pending" && end >= now;
        return !isUpcoming;
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  }, [appointments, now]);

  return (
    <div className="space-y-6">
      {/* ===== PHẦN TRÊN: CUỘC GỌI SẮP DIỄN RA ===== */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-1">
          Cuộc gọi sắp diễn ra với {doctor?.accountId.fullName || "bác sĩ"}
        </h3>
        <p className="text-slate-600 mb-4">
          Hệ thống sẽ nhắc trước 15 phút. Mỗi lịch kéo dài <b>45 phút</b>.
        </p>

        <div className="divide-y">
          {upcoming.length === 0 && (
            <div className="text-slate-500 py-2">
              Hiện chưa có cuộc gọi nào sắp diễn ra với{" "}
              {doctor?.accountId.fullName || "bác sĩ"}.
            </div>
          )}

          {upcoming.map((a) => {
            const start = new Date(a.startTime);
            const end = new Date(a.endTime);
            const startMs = start.getTime();
            const endMs = end.getTime();

            // ✅ chỉ join được trong khoảng [startTime - 15p, endTime]
            const canJoin = nowMs >= startMs - FIFTEEN_MIN_MS && nowMs <= endMs;

            return (
              <div
                key={a._id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{prettyTime(a.startTime)}</div>
                  <div className="text-sm text-slate-600">
                    {a.reason || "Không có ghi chú"} · 45 phút
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sắp diễn ra
                  </span>

                  <button
                    type="button"
                    disabled={!canJoin}
                    onClick={() => {
                      if (!canJoin) return;
                      joinRoom(a);
                    }}
                    title={
                      !canJoin
                        ? "Bạn chỉ có thể vào phòng trong vòng 15 phút trước giờ hẹn."
                        : "Vào phòng tư vấn"
                    }
                    className={
                      "px-3 py-1.5 rounded-lg text-sm " +
                      (canJoin
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-300 text-slate-600 cursor-not-allowed")
                    }
                  >
                    Vào phòng
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* ===== PHẦN DƯỚI: LỊCH SỬ CUỘC GỌI ===== */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-1">
          Lịch sử cuộc gọi với {doctor?.accountId.fullName || "bác sĩ"}
        </h3>
        <p className="text-slate-600 mb-4 text-sm">
          Bao gồm các cuộc gọi đã diễn ra, hoàn thành hoặc đã hủy.
        </p>

        <div className="divide-y">
          {history.length === 0 && (
            <div className="text-slate-500 py-2">
              Chưa có cuộc gọi nào trong lịch sử với{" "}
              {doctor?.accountId.fullName || "bác sĩ"}.
            </div>
          )}

          {history.map((a) => {
            const session =
              sessions.find(
                (e) => e.appointmentId._id.toString() === a._id.toString()
              ) || null;

            const isCompleted =
              (a.status === "completed" || a.status === "complete") && session;
            const isCancelled = a.status === "cancelled";
            const isMissed =
              !isCompleted && !isCancelled && new Date(a.endTime) < now;

            return (
              <div
                key={a._id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{prettyTime(a.startTime)}</div>
                  {!isCancelled && (
                    <div className="text-sm text-slate-600">
                      {a.reason || "Không có ghi chú"} · 45 phút
                    </div>
                  )}

                  {isCancelled && a.reason && (
                    <div className="text-xs text-rose-500 mt-0.5">
                      Lý do hủy: {a.reason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      isCompleted
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : isCancelled
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : isMissed
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {isCompleted
                      ? "Hoàn thành"
                      : isCancelled
                      ? "Đã hủy"
                      : isMissed
                      ? "Đã quá giờ"
                      : a.status}
                  </span>

                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => reviewAppt(session)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm"
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
      {openCall ? (
        <VideoCallPopup
          key="call-popup" // ép React unmount đúng 1 lần
          roomId={callRoomId}
          open={true}
          onClose={() => {
            setCallRoomId(null);
            setOpenCall(false);
          }}
        />
      ) : null}
    </div>
  );
}
