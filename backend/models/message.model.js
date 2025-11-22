import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      index: true,
    },
    senderType: { type: String, enum: ["user", "doctor", "system"] },
    content: String,
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: String,
    read: Boolean,
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
