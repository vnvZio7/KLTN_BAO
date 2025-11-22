import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  code: { type: String, index: true },
  answers: [Number],
  totalScore: Number,
  band: String, // "Bình thường" | "Nhẹ" | "Trung bình" | "Nặng"

  takenAt: { type: Date, default: Date.now },
});
testResultSchema.index({ patientId: 1, takenAt: -1 });

export default mongoose.model("TestResult", testResultSchema);
