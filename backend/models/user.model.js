import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      index: true,
    },
    walletBalance: { type: Number, default: 0 }, // so du
    testHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestResult",
      },
    ],
    dominantSymptom: String, // Lo âu, Trầm cảm
    aiNotes: String, // Ghi chú AI (giải thích ngắn)
    doctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    currentDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
