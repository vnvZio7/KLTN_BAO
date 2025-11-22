import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  startTime: Date,
  endTime: Date,
  meetingUrl: String,
  duration: Number, // phút
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
