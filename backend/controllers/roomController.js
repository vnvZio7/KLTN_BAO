import Room from "../models/room.model.js";
import { createNotification } from "./notificationController.js";
// @desc    Get all rooms (Admin only)
// @route   GET /api/rooms/
// @access  Private (Admin)
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoom = async (req, res) => {
  try {
    const myId = req.user._id; // id của người đang login

    let query = {
      $or: [{ doctorId: myId }, { userId: myId }],
    };

    // 👉 nếu là doctor thì mới check status
    if (req.account.role === "doctor") {
      query.status = { $ne: "completed" };
    }
    const room = await Room.find(query).lean();
    console.log(room);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    console.log(req.user);
    const room = await Room.create({
      userId: req.user._id,
      doctorId: req.body.doctorId,
    });
    await createNotification({
      userId: req.user._id,
      title1: "Kết nối thành công tới bác sĩ",
      message:
        "Hệ thống đã kết nối thành công bạn với bác sĩ. Xem chi tiết ở trang thông tin bác sĩ",
      type: "system",
    });
    await createNotification({
      doctorId: req.body.doctorId,
      title1: "Bệnh nhân mới",
      message: `Bạn vừa được ghép nối với một bệnh nhân - ${req.account.fullName}`,
      type: "system",
    });

    res.status(201).json({ message: "Đã tạo room thành công!", room });
  } catch (err) {
    console.error("create error:", err);
    return res.status(500).json({
      message: "Lỗi server khi cập tạo room",
      error: err.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { status, roomId } = req.body;
    const room = await Room.findByIdAndUpdate(roomId, {
      $set: {
        status,
        sendId:
          status === "pause"
            ? req.account.role === "user"
              ? "user"
              : "doctor"
            : null,
      },
    });
    let userId = null,
      doctorId = null;
    if (req.account.role === "user") {
      doctorId = room.doctorId;
    }
    if (req.account.role === "doctor") {
      userId = room.userId;
    }
    if (status === "pause") {
      await createNotification({
        userId,
        doctorId,
        title1: "Yêu cầu hoàn thành điều trị",
        message: `${
          req.account.role === "user"
            ? "Bệnh nhân " + req.account.fullName
            : "Bác sĩ"
        } vừa gửi yêu cầu hoàn thành điều trị. Hãy kiểm tra trong tin nhắn`,
        type: "system",
      });
    } else if (status === "complete") {
      await createNotification({
        userId,
        doctorId,
        title1: "Phản hồi yêu cầu hoàn thành điều trị",
        message: `${
          req.account.role === "user"
            ? "Bệnh nhân " + req.account.fullName
            : "Bác sĩ"
        } đã chấp nhận yêu cầu hoàn thành điều trị. Khóa trị liệu kết thúc tại đây.`,
        type: "system",
      });
    } else if (status === "active") {
      await createNotification({
        userId,
        doctorId,
        title1: "Phản hồi yêu cầu hoàn thành điều trị",
        message: `${
          req.account.role === "user"
            ? "Bệnh nhân " + req.account.fullName
            : "Bác sĩ"
        } đã từ chối yêu cầu hoàn thành điều trị. Hãy tiếp tục hoàn thành khóa điều trị này.`,
        type: "system",
      });
    }
    res.status(201).json({ message: "Đã cập nhật room thành công!", room });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi server khi cập nhật room",
      error: err.message,
    });
  }
};

export { getRooms, getRoom, createRoom, updateRoom };
