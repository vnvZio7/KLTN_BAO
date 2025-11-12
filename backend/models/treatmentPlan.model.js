import mongoose from "mongoose";

const treatmentPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  startDate: { type: Date, default: Date.now },
  endDate: Date, // chỉ có khi kết thúc trị liệu
  status: {
    type: String,
    enum: ["active", "completed", "paused"],
    default: "active",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TreatmentPlan", treatmentPlanSchema);
