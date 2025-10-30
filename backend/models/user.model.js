import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    psychologicalScore: Number,
    disorderLevel: String,
    walletBalance: { type: Number, default: 0 }, // so du
    testHistory: [
      { testId: mongoose.Schema.Types.ObjectId, result: Number, date: Date },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
