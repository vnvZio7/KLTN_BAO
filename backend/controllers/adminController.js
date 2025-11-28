import Account from "../models/account.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
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
      // const deleted = await Doctor.findByIdAndDelete(id);

      // if (!deleted) {
      //   res.status(404).json({ message: "Không tìm thấy bác sĩ" });
      // }

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

export { getAccounts, getAllTransactions, updateApproval };
