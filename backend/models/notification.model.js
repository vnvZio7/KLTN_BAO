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
        "doctor-switch-request", // user yêu cầu đổi bác sĩ
        "doctor-approved", // admin duyệt
        "payment", // thanh toán, upgrade
        "system", // thông báo hệ thống chung
        "homework", // thông báo BTVN
      ],
      default: "system",
    },
    // Trạng thái đọc
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
