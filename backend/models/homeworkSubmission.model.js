import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: ObjectId, ref: "HomeworkAssignment", index: true },
    userId: { type: ObjectId, ref: "User" },
    answers: mongoose.Schema.Types.Mixed, // JSON các phản hồi/bài làm
    attachments: [String],
    selfRating: { type: Number, min: 1, max: 5 }, // cảm nhận hiệu quả
    moodBefore: { type: Number, min: 1, max: 10 },
    moodAfter: { type: Number, min: 1, max: 10 },
    feedbackDoctor: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);
