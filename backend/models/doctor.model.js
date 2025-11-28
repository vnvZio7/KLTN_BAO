import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    index: true,
  },
  role: {
    type: String,
    enum: ["counselor", "therapist", "psychiatrist"],
    required: true,
  },
  specializations: [{ type: String }], // ["trầm cảm","lo âu","mất ngủ","hôn nhân", ...]
  modalities: [{ type: String }], // ["CBT","ACT","Mindfulness","Family","Trauma-focused"]
  yearsExperience: Number,
  certificates: [String],
  pricePerWeek: { type: Number, default: 0 },
  bio: String,
  avatar: String,
  approval: {
    status: {
      type: String,
      enum: [
        "pending", // đã gửi - chờ admin duyệt
        "approved", // đã được duyệt - có thể hoạt động
        "rejected", // bị từ chối - cần sửa/gửi lại
        "frozen", // tam dung
      ],
      default: "pending",
    },
  },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
});
doctorSchema.index({ specializations: 1, modalities: 1, pricePerWeek: 1 });

export default mongoose.model("Doctor", doctorSchema);
