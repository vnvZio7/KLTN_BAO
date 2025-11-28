// src/controllers/accountController.js
import { generateToken } from "../config/jwt.js";

import Account from "../models/account.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import {
  uploadBufferToCloudinary,
  uploadManyBuffers,
} from "../utils/uploadCloudinary.js";

const registerUser = async (req, res) => {
  try {
    if (!req.body?.data) {
      return res.status(400).json({ message: "Thiếu 'data' trong FormData" });
    }

    // 'data' là string JSON vì FE đã append JSON.stringify(payload)
    const parsed = JSON.parse(req.body.data);
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      birthDate,
      role,
      profile = {},
    } = parsed;

    if (!fullName || !email || !password || !gender || !birthDate || !role) {
      return res.status(400).json({ message: "Thiếu trường bắt buộc" });
    }

    const existed = await Account.findOne({ email });
    if (existed) return res.status(400).json({ message: "Email đã tồn tại" });

    // 1) Tạo account
    const account = await Account.create({
      fullName,
      email,
      password,
      phone,
      gender,
      birthDate,
      role,
    });

    // 2) Tạo hồ sơ theo role
    if (role === "user") {
      await User.create({ accountId: account._id });
    } else if (role === "doctor") {
      const {
        role: dRole,
        specializations = [],
        modalities = [],
        yearsExperience,
        pricePerWeek,
        bio,
      } = profile;

      if (
        !dRole ||
        !specializations.length ||
        !modalities.length ||
        pricePerWeek == null ||
        !bio?.trim()
      ) {
        return res.status(400).json({
          message: "Thiếu thông tin chuyên môn (role/spec/modalities/bio)",
        });
      }

      // 1) Avatar
      let avatarUrl = null;
      if (req.files?.avatar?.[0]) {
        avatarUrl = await uploadBufferToCloudinary(
          req.files.avatar[0], // ⬅️ TRUYỀN CẢ FILE
          "pomera/doctors/avatars"
        );
      }

      // 2) Certificates
      let certificateUrls = [];
      if (req.files?.certificates?.length) {
        certificateUrls = await uploadManyBuffers(
          req.files.certificates, // ⬅️ OK
          "pomera/doctors/certificates"
        );
      }

      await Doctor.create({
        accountId: account._id,
        role: dRole, // counselor | therapist | psychiatrist
        specializations,
        modalities,
        yearsExperience,
        pricePerWeek,
        avatar: avatarUrl || undefined,
        bio,
        certificates: certificateUrls, // URL Cloudinary
        approval: { status: "pending" }, // chờ duyệt
      });
    } else {
      return res.status(400).json({ message: "role không hợp lệ" });
    }

    return res.status(201).json({
      message: "Đăng ký thành công",
      account: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });

    if (!account) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không hợp lệ" });
    }

    // Compare password
    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không hợp lệ" });
    }

    // Return user data with JWT
    res.json({
      account: {
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

const getUserProfile = async (req, res) => {
  try {
    let user;
    if (req.account.role === "user") {
      user = await User.findOne({ _id: req.user._id })
        .populate("accountId")
        // populate mảng doctorIds, rồi populate tiếp accountId bên trong Doctor
        .populate({
          path: "doctorIds",
          populate: {
            path: "accountId",
            model: "Account",
            select: "-password", // nếu muốn ẩn password của account bác sĩ
          },
        })
        // populate currentDoctorId + accountId của bác
        .populate({
          path: "currentDoctorId",
          populate: {
            path: "accountId",
            model: "Account",
            select: "-password",
          },
        });
    } else if (req.account.role === "doctor") {
      user = await Doctor.findOne({ _id: req.user._id }).populate("accountId");
    } else if (req.account.role === "admin") {
      user = req.account;
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    const account_id = req.params.id;

    res.json({ account: req.account, user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { registerUser, loginUser, getUserProfile, getProfileById };
