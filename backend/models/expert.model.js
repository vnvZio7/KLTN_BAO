import mongoose from "mongoose";

const expertSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: [{ type: String }], // ví dụ: ["stress", "depression"]
    experience_years: { type: Number },
    description: { type: String },
    certificate_urls: [{ type: String }],
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    work_schedules: [
      {
        day: { type: String }, // "monday"
        available_slots: [{ type: String }], // ["08:00-10:00"]
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Expert", expertSchema);
