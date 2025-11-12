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
    currentDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
