import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  role: {
    type: String,
    enum: ["counselor", "therapist", "psychiatrist"],
    required: true,
  },
  specializations: [{ type: String }], // ["trầm cảm","lo âu","mất ngủ","hôn nhân", ...]
  modalities: [{ type: String }], // ["CBT","ACT","Mindfulness","Family","Trauma-focused"]
  yearsExperience: Number,
  certificates: [String],
  bio: String, // mô tả ngắn 2–3 câu
  approval: {
    status: {
      type: String,
      enum: [
        "pending", // đã gửi - chờ admin duyệt
        "approved", // đã được duyệt - có thể hoạt động
        "rejected", // bị từ chối - cần sửa/gửi lại
      ],
      default: "pending",
    },
  },
  rating: { type: Number, default: 0 },
});

module.exports = mongoose.model("Doctor", doctorSchema);
