import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  code: String,
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paidAt: Date,
});
module.exports = mongoose.model("Transaction", transactionSchema);
