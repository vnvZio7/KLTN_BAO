import mongoose from "mongoose";

// Appointment: lịch tư vấn
const appointmentSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    index: true,
  },
  startTime: { type: Date, index: true },
  endTime: { type: Date, index: true },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Appointment", appointmentSchema);
