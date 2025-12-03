import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeworkAssignment",
      index: true,
    },
    answers: String, // JSON các phản hồi/bài làm
    attachments: [String],
    selfRating: { type: Number, min: 1, max: 5 }, // cảm nhận hiệu quả
    moodBefore: { type: Number, min: 1, max: 10 },
    moodAfter: { type: Number, min: 1, max: 10 },
    feedbackDoctor: String,
  },
  { timestamps: true }
);

export default mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);
