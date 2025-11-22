import Appointment from "../models/appointment.model.js";

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

    // Mongoose sẽ tự cast string → ObjectId
    const appointments = await Appointment.find({
      roomId: roomId,
    }).lean();
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { getAppointments, getAppointmentsByRoomId };
