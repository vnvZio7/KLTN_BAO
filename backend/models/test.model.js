import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, index: true },
  title: String,
  description: String,
  questions: [
    {
      question: String,
      options: [String],
      scores: [Number], // điểm tương ứng với mỗi lựa chọn
    },
  ],
  scoring: {
    // ngưỡng severity (tuỳ test)
    thresholds: [
      {
        min: Number,
        max: Number,
        label: String, // ví dụ PHQ-9: none/mild/moderate/moderately_severe/severe
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Test", testSchema);
