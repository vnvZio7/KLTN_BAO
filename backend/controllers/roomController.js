import Room from "../models/room.model.js";
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

    const room = await Room.find({
      status: "active",
      $or: [{ doctorId: myId }, { userId: myId }],
    }).lean();
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
    console.log(room);
    console.log(req.body.doctorId);
    res.status(201).json({ message: "Đã tạo room thành công!", room });
  } catch (err) {
    console.error("create error:", err);
    return res.status(500).json({
      message: "Lỗi server khi cập tạo room",
      error: err.message,
    });
  }
};

export { getRooms, getRoom, createRoom };
