import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    psychologicalScore: Number,
    disorderLevel: String,
    testHistory: [
      { testId: mongoose.Schema.Types.ObjectId, result: Number, date: Date },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
