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
      mapping: {
        type: Map,
        of: [String],
        default: {},
      },
    },
  ],
  maxScrore: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Test", testSchema);
