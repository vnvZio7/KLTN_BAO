import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  answers: [Number],
  totalScore: Number,
  aiRecommendedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // bác sĩ phù hợp
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestResult", testResultSchema);
