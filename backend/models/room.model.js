// models/room.model.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date, // chỉ có khi kết thúc trị liệu
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    lastMessageAt: { type: Date },
    lastMessage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
