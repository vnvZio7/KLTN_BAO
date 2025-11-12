import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const accountSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    birthDate: { type: Date },
    role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Kiểm tra mật khẩu
accountSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Account", accountSchema);
