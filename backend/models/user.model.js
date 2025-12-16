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
    freeCall: { type: Number, default: 1 },
    firstCallInWeek: { type: Boolean, default: true },
    retest: { type: Boolean, default: false },
    lastGAD7Score: Number,
    lastPHQ9Score: Number,
    dominantSymptom: String, // Lo âu, Trầm cảm
    // aiNotes: String, // Ghi chú AI (giải thích ngắn)
    doctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    currentDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    switchDoctor: [
      {
        currentDoctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
        },
        switchDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        switchDoctorStatus: { type: String },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
