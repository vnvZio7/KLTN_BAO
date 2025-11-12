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
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
