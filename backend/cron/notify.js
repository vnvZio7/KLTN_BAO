import Appointment from "../models/appointment.model.js";
import Notification from "../models/notification.model.js";

export async function notifyTodayAppointments() {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    status: "pending",
    notifiedToday: false,
    startTime: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate({
    path: "roomId",
    populate: [
      { path: "userId", populate: { path: "accountId", select: "fullName" } },
      { path: "doctorId", populate: { path: "accountId", select: "fullName" } },
    ],
  });

  for (const appt of appointments) {
    const room = appt.roomId;
    if (!room) continue;

    const timeStr = appt.startTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // User notification
    await Notification.create({
      userId: room.userId._id,
      title: "Lịch hẹn hôm nay",
      message: `Hôm nay bạn có cuộc hẹn với bác sĩ ${room.doctorId.accountId.fullName} lúc ${timeStr}`,
      type: "system",
    });

    // Doctor notification
    await Notification.create({
      doctorId: room.doctorId._id,
      title: "Lịch khám hôm nay",
      message: `Hôm nay bạn có lịch hẹn với bệnh nhân ${room.userId.accountId.fullName} lúc ${timeStr}`,
      type: "system",
    });

    appt.notifiedToday = true;
    await appt.save();
  }
}
export async function notifyAppointment15Minutes() {
  const now = new Date();
  const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

  const appointments = await Appointment.find({
    status: "pending",
    notified15m: false,
    startTime: {
      $gte: now,
      $lte: in15Minutes,
    },
  }).populate({
    path: "roomId",
    populate: [
      { path: "userId", populate: { path: "accountId", select: "fullName" } },
      { path: "doctorId", populate: { path: "accountId", select: "fullName" } },
    ],
  });

  for (const appt of appointments) {
    const room = appt.roomId;
    if (!room) continue;

    // User
    await Notification.create({
      userId: room.userId._id,
      title: "Sắp đến giờ hẹn",
      message: `15 phút nữa sẽ bắt đầu cuộc gọi với bác sĩ ${room.doctorId.accountId.fullName}`,
      type: "system",
    });

    // Doctor
    await Notification.create({
      doctorId: room.doctorId._id,
      title: "Sắp đến giờ khám",
      message: `15 phút nữa sẽ bắt đầu cuộc gọi với bệnh nhân ${room.userId.accountId.fullName}`,
      type: "system",
    });

    appt.notified15m = true;
    await appt.save();
  }
}
