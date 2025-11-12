import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  code: { type: String, index: true },
  answers: [Number],
  totalScore: Number,
  band: String, // "Bình thường" | "Nhẹ" | "Trung bình" | "Nặng"
  dominantSymptom: String, // Lo âu, Trầm cảm
  aiNotes: String, // Ghi chú AI (giải thích ngắn)
  takenAt: { type: Date, default: Date.now },
});
testResultSchema.index({ patientId: 1, takenAt: -1 });

module.exports = mongoose.model("TestResult", testResultSchema);
