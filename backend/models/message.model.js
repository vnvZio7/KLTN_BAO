import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      index: true,
    },
    senderType: { type: String, enum: ["user", "doctor", "system"] },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    content: String,
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl,
    String,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
