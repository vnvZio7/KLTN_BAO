import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    birth_date: { type: Date },
    role: { type: String, enum: ["user", "expert", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
