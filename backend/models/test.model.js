import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [
    {
      question: String,
      options: [String],
      scores: [Number], // điểm tương ứng với mỗi lựa chọn
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Test", testSchema);
