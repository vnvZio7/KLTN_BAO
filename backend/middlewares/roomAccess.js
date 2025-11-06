// middlewares/roomAccess.js
import Room from "../models/room.model.js";

const roomAccess = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const now = new Date();

    const isParticipant =
      req.user._id.equals(room.userId) || req.user._id.equals(room.doctorId);

    // const inTimeRange = now >= room.startTime && now <= room.endTime;

    if (!isParticipant)
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập phòng này" });

    // if (!inTimeRange)
    //   return res.status(403).json({ message: "Phòng chưa mở hoặc đã đóng" });

    req.room = room;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export default roomAccess;
