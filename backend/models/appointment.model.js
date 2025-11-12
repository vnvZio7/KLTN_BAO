import mongoose from "mongoose";

// Appointment: lịch tư vấn
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    index: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    index: true,
  },
  startTime: { type: Date, index: true },
  endTime: { type: Date, index: true },
  status: {
    type: String,
    enum: ["pending", "paid", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  reason: String,

  // video session (không lưu token nhạy cảm lâu dài)
  video: {
    provider: {
      type: String,
      enum: ["WebRTC", "Twilio", "Daily", "Other"],
      default: "WebRTC",
    },
    roomId: String,
  },

  session_count: Number,
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
