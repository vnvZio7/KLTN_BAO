import mongoose from "mongoose";
// Giao bài
const homeworkAssignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseTemplate",
    }, // hoặc null nếu custom
    title: String, // nếu custom
    method: {
      type: String, // CBT, ACT
    },
    content: String, // nếu custom
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    attachments: [String],
    dueDate: Date, // hạn hoàn thành
    estimatedMinutes: Number,
    status: {
      type: String,
      enum: ["assigned", "completed", "overdue"],
      default: "assigned",
    },
    aiSuggested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("HomeworkAssignment", homeworkAssignmentSchema);
