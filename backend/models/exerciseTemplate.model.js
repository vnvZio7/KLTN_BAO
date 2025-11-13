import mongoose from "mongoose";

// Thư viện bài tập
const exerciseTemplateSchema = new mongoose.Schema(
  {
    title: String,
    method: {
      type: String, // CBT, ACT
    },
    targetSymptoms: [String], // ["Tram cam","Lo au","insomnia",...]
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    estimatedMinutes: Number, // thời lượng thực hiện
    content: { type: String }, // hướng dẫn chi tiết (markdown hoặc text)
    attachments: [String], // file/audio/video đính kèm
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  { timestamps: true }
);

export default mongoose.model("ExerciseTemplate", exerciseTemplateSchema);
