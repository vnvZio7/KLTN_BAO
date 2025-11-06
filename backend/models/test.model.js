import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
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
