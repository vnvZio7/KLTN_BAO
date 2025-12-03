import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  meetingUrl: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
