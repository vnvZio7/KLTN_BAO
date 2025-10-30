import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  specialization: [String], // chuyen mon
  externalFactor: [String], // yeu to tac dong
  experience: String,
  certificates: [String],
  description: String,
  rating: { type: Number, default: 0 },
});

module.exports = mongoose.model("Doctor", doctorSchema);
