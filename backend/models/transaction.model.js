import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

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
