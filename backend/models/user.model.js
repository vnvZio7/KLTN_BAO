import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      index: true,
    },
    lastPHQ9Score: Number,
    lastGAD7Score: Number,
    walletBalance: { type: Number, default: 0 }, // so du
    testHistory: [
      { testId: mongoose.Schema.Types.ObjectId, result: Number, date: Date },
    ],
    currentDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
