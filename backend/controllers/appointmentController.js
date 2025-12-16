import Appointment from "../models/appointment.model.js";
import Room from "../models/room.model.js";
import { prettyTime } from "../utils/helper.js";
import { createNotification } from "./notificationController.js";

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("accountId");
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getAppointmentsByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const appointments = await Appointment.find({
      roomId: roomId,
    })
      .populate({
        path: "roomId",
        populate: {
          path: "userId",
          populate: { path: "accountId", select: "-password" },
        },
      })
      .lean();
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu trường thông tin" });
    }

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    const now = new Date();
    // ❌ Không được đặt lịch quá khứ
    if (newStart < now) {
      return res.status(400).json({
        message: "Không thể đặt lịch ở thời điểm đã qua",
        errorType: "PAST_TIME_NOT_ALLOWED",
      });
    }

    // 🔍 Check trùng lịch trong cùng room
    // Điều kiện overlap:
    // existing.startTime < newEnd  AND  existing.endTime > newStart
    const doctorRoomIds = await Room.find({ doctorId }).distinct("_id");
    const conflict = await Appointment.findOne({
      roomId: { $in: doctorRoomIds },
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart },
      status: "pending",
    });

    if (conflict) {
      return res.status(409).json({
        message: "Bác sĩ đã có lịch trong khoảng thời gian này",
        conflict,
      });
    }

    // ✅ Không trùng, tạo mới
    const appointment = await Appointment.create({
      roomId,
      startTime: newStart,
      endTime: newEnd,
    });

    const room = await Room.findById(roomId).populate("userId");
    await createNotification({
      userId: room.userId,
      title1: "Lịch hẹn mới với bác sĩ",
      message: `Bạn đã được đặt lịch hẹn với bác sĩ vào ${prettyTime(
        newStart
      )}`,
      type: "call",
    });

    res.status(201).json({
      success: true,
      message: "Đặt lịch cuộc gọi thành công",
      appointment,
    });
  } catch (error) {
    console.error("createAppointment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: req.body.status, reason: req.body.reason } },
      { new: true }
    );
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getAppointments,
  getAppointmentsByRoomId,
  createAppointment,
  updateAppointment,
};
