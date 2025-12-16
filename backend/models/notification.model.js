import mongoose from "mongoose";
// Notification: nhắc test, nhắc bài tập, nhắc lịch
const notificationSchema = new mongoose.Schema(
  {
    // Ai sẽ nhận thông báo
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // vì admin notifications không cần userId
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },
    admin: { type: Boolean, default: false },
    // Nội dung thông báo
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Loại thông báo
    type: {
      type: String,
      enum: [
        "payment", // thanh toán, upgrade
        "system", // thông báo hệ thống chung
        "homework", // thông báo BTVN
        "call", // thông báo BTVN
      ],
      default: "system",
    },
    // Trạng thái đọc
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ doctorId: 1, createdAt: -1 });
notificationSchema.index({ admin: 1, createdAt: -1 });
export default mongoose.model("Notification", notificationSchema);
