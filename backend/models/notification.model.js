import mongoose from "mongoose";
// Notification: nhắc test, nhắc bài tập, nhắc lịch
const notificationSchema = new mongoose.Schema(
  {
    accountId: { type: ObjectId, ref: "Account", index: true },
    type: {
      type: String,
      enum: [
        "reminder_test",
        "reminder_homework",
        "appointment_upcoming",
        "system",
      ],
    },
    payload: mongoose.Schema.Types.Mixed, // { testCode, assignmentId, appointmentId, ... }
    channels: [
      {
        type: String,
        enum: ["inapp", "email", "sms", "push"],
        default: "inapp",
      },
    ],
    scheduledAt: Date,
    sentAt: Date,
    status: {
      type: String,
      enum: ["scheduled", "sent", "failed", "canceled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
