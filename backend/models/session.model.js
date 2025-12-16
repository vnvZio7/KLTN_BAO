import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // ✅ 1 appointment chỉ có 1 session
    index: true,
    ref: "Appointment",
  },
  recordingUrls: { type: [String], default: [] },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null }, // lúc dừng record
  durationSec: { type: Number, default: 0 },
});

export default mongoose.model("Session", sessionSchema);
