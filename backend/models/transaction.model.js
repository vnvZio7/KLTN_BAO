import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  code: { type: String, required: true, unique: true },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paidAt: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
