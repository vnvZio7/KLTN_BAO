// src/controllers/accountController.js
import { generateToken } from "../config/jwt";

import Account from "../models/account.model";
import Doctor from "../models/doctor.model";
import User from "../models/user.model";

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, gender, birthDate, role } =
      req.body;

    // kiểm tra trùng email
    const existing = await Account.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    // tạo account
    const account = await Account.create({
      fullName,
      email,
      password,
      phone,
      gender,
      birthDate,
      role,
    });

    // tạo profile
    if (role === "user") {
      await User.create({
        accountId: account._id,
      });
    } else if (role === "doctor") {
      await Doctor.create({
        accountId: account._id,
        specialization: req.body.specialization, // chuyen mon
        externalFactor: req.body.externalFactor, // yeu to tac dong
        experience: req.body.experience,
        certificates: req.body.certificates,
        description: req.body.description,
      });
    }
    // // Return user data with JWT
    // res.status(201).json({
    //   id: account._id,
    //   fullName,
    //   email,
    //   role,
    //   token: generateToken(account._id),
    //   message: "Đăng ký thành công",
    // });
    res.status(201).json({ message: "Đăng ký thành công", account });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });

    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password1" });
    }

    // Return user data with JWT
    res.json({
      user: {
        _id: account.id,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
      },
      token: generateToken(account),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
export { registerUser, loginUser };
