import Room from "../models/room.model.js";
// @desc    Get all rooms (Admin only)
// @route   GET /api/rooms/
// @access  Private (Admin)
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("accountId").select("-password");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomByUserId = async (req, res) => {
  try {
    const room = await Room.findOne(req.params.id)
      .populate("accountId")
      .select("-password");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createRoom = async (req, res) =>{
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    
  }
}

export { getRooms, getRoomByUserId,createRoom };
