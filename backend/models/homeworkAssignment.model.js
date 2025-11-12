import mongoose from "mongoose";
// Giao bài
const homeworkAssignmentSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "User", index: true },
    doctorId: { type: ObjectId, ref: "Doctor", index: true },
    templateId: { type: ObjectId, ref: "ExerciseTemplate" }, // hoặc null nếu custom
    title: String, // nếu custom
    content: String, // nếu custom
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly"],
      default: "daily",
    },
    dueDate: Date, // hạn hoàn thành
    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed", "overdue"],
      default: "assigned",
    },
    aiSuggested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeworkAssignment", homeworkAssignmentSchema);
