import Account from "../models/account.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import Room from "../models/room.model.js";
import { createNotification } from "./notificationController.js";
// @desc    Get all accounts (Admin only)
// @route   GET /api/accounts/
// @access  Private (Admin)
const getAccounts = async (req, res) => {
  try {
    const doctors = (
      await Doctor.find()
        .populate({
          path: "accountId",
          select: "-password",
        })
        .lean()
    ).filter((d) => d.accountId); // loại doctor có account admin

    const users = (
      await User.find()
        .populate({
          path: "accountId",
          match: { role: { $ne: "admin" } },
          select: "-password",
        })
        .lean()
    ).filter((u) => u.accountId);
    res.json({ accounts: { doctors, users } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      // .populate({
      //   path: "doctorId",
      //   populate: {
      //     path: "accountId",
      //     model: "Account",
      //     select: "-password",
      //   },
      // })
      .sort({
        createdAt: -1,
      });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Nếu bạn muốn hỗ trợ "frozen", thêm nó vào mảng này
    const allowed = ["pending", "approved", "rejected", "frozen"]; // hoặc ["pending","approved","rejected","frozen"]
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
        allowed,
      });
    }

    if (status === "rejected") {
      const { reason } = req.body;
      console.log("delete: ", reason);

      if (!reason || reason.trim().length < 3) {
        return res.status(400).json({
          message: "Bạn phải nhập lý do từ chối tối thiểu 3 ký tự.",
        });
      }
      return res.json({
        message: "Đã từ chối và xoá hồ sơ bác sĩ khỏi hệ thống",
        id,
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { "approval.status": status },
      { new: true }
    ).lean();

    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    return res.json({
      message: "Cập nhật trạng thái thành công",
      doctor,
    });
  } catch (err) {
    console.error("updateDoctorApproval error:", err);
    return res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái duyệt",
      error: err.message,
    });
  }
};

const updateUserAfterSwitchDoctor = async (req, res) => {
  try {
    const { userId, status, reason } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.switchDoctor || user.switchDoctor.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có yêu cầu đổi bác sĩ nào để cập nhật" });
    }

    // phần tử cuối cùng trong danh sách yêu cầu đổi bác sĩ
    const lastIndex = user.switchDoctor.length - 1;
    const lastReq = user.switchDoctor[lastIndex];

    // ✅ CHỈ sửa field cần thiết, không gán lại cả object
    if (status) {
      lastReq.switchDoctorStatus = status;
    }
    if (reason) {
      lastReq.reason = reason;
    }
    if (status === "accept") {
      const newDoctorId = lastReq.switchDoctorId;

      // 1. Cập nhật currentDoctorId
      const roomOld = await Room.findOneAndUpdate(
        {
          userId,
          doctorId: user.currentDoctorId,
        },
        {
          $set: { status: "pause" },
        },
        { new: true } // trả về bản đã update
      );
      user.currentDoctorId = newDoctorId;

      // 3. Tạo Room nếu chưa có

      let room = await Room.findOne({
        userId: user._id,
        doctorId: newDoctorId,
      });

      if (!room) {
        room = await Room.create({
          userId: user._id,
          doctorId: newDoctorId,
          status: "active",
          startDate: new Date(),
        });
      } else {
        // 👉 Đã có → mở lại room
        room.status = "active";
        room.endDate = null;
        await room.save();
      }

      await user.save();

      return res.json({
        success: true,
        message: "Đã chấp nhận yêu cầu đổi bác sĩ",
        user,
        room,
      });
    }
    await user.save();
    console.log(user);
    await createNotification({
      userId,
      title1: "Phê duyệt yêu cầu đổi bác sĩ",
      message: `Admin đã từ chối yêu cầu của bạn. Lý do: ${reason}`,
      type: "system",
    });
    res.json({
      success: true,
      message: "Cập nhật yêu cầu đổi bác sĩ thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getAccounts,
  getAllTransactions,
  updateApproval,
  updateUserAfterSwitchDoctor,
};
