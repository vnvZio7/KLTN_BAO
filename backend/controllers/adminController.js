import Account from "../models/account.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import Room from "../models/room.model.js";
import { createNotification } from "./notificationController.js";
import { sendMail } from "../config/sendMail.js";
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
    const { status, reason } = req.body;

    const allowed = ["pending", "approved", "rejected", "frozen"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
        allowed,
      });
    }
    console.log("doctorData check..... ");

    // ✅ Populate đủ thông tin để gửi email
    const doctorData = await Doctor.findById(id).populate(
      "accountId",
      "email fullName"
    );
    console.log("doctorData: ", doctorData);
    if (!doctorData) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const email = doctorData.accountId?.email;
    const fullName = doctorData.accountId?.fullName || "Bạn";

    if (!email) {
      return res
        .status(400)
        .json({ message: "Không có email để gửi thông báo" });
    }

    // =========================
    // REJECTED: xoá + gửi email
    // =========================
    if (status === "rejected") {
      if (!reason || reason.trim().length < 3) {
        return res.status(400).json({
          message: "Bạn phải nhập lý do từ chối tối thiểu 3 ký tự.",
        });
      }

      await Doctor.findByIdAndDelete(id);
      await Account.findByIdAndDelete(doctorData.accountId);
      sendMail({
        to: email,
        subject: "Pomera: Kết quả xét duyệt hồ sơ bác sĩ",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6">
            <h2 style="margin:0 0 12px">Thông báo kết quả xét duyệt</h2>
            <p>Chào <b>${fullName}</b>,</p>
            <p>Rất tiếc, hồ sơ đăng ký bác sĩ của bạn trên <b>Pomera</b> chưa được chấp nhận.</p>

            <p><b>Lý do:</b> ${reason}</p>

            <p>Bạn có thể cập nhật/bổ sung thông tin và nộp lại hồ sơ để được xét duyệt lại.</p>

            <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
            <p style="color:#666;font-size:12px;margin:0">
              Email này được gửi tự động. Vui lòng không trả lời.
            </p>
          </div>
        `,
      }).catch(console.error);

      return res.json({
        message:
          "Đã từ chối và xoá hồ sơ bác sĩ khỏi hệ thống. Đã gửi thông báo qua email cho bác sĩ.",
        id,
      });
    }

    // ==================================
    // Các status khác: update approval
    // ==================================
    const updateDoc = {
      "approval.status": status,
    };

    const doctor = await Doctor.findByIdAndUpdate(id, updateDoc, {
      new: true,
    }).lean();

    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    // =========================
    // Gửi email theo status
    // =========================
    if (status === "approved") {
      if (doctorData.approval.status === "pending") {
        sendMail({
          to: email,
          subject: "Pomera: Hồ sơ bác sĩ đã được chấp nhận",
          html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="margin:0 0 12px">🎉 Hồ sơ đã được chấp nhận</h2>

          <p>Chào <b>${fullName}</b>,</p>

          <p>
            Chúc mừng bạn! Hồ sơ đăng ký bác sĩ của bạn trên nền tảng 
            <b>Pomera</b> đã được <b>xét duyệt và chấp nhận</b>.
          </p>

          <p>Từ bây giờ, bạn có thể:</p>
          <ul>
            <li>Đăng nhập vào hệ thống Pomera</li>
            <li>Nhận và quản lý lịch hẹn với bệnh nhân</li>
            <li>Thực hiện tư vấn trực tuyến và theo dõi tiến trình trị liệu</li>
          </ul>

          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="color:#666;font-size:12px;margin:0">
            Email này được gửi tự động từ hệ thống Pomera. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
        }).catch(console.error);
      }

      // 🔓 Từ frozen → approved (mở khóa / bỏ đóng băng)
      else if (doctorData.approval.status === "frozen") {
        sendMail({
          to: email,
          subject: "Pomera: Tài khoản bác sĩ đã được mở khóa",
          html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="margin:0 0 12px">🔓 Tài khoản đã được mở khóa</h2>

          <p>Chào <b>${fullName}</b>,</p>

          <p>
            Tài khoản bác sĩ của bạn trên <b>Pomera</b> đã được 
            <b>mở khóa</b> và hiện có thể hoạt động trở lại bình thường.
          </p>

          <p>
            Bạn có thể đăng nhập để tiếp tục nhận lịch hẹn và thực hiện
            các phiên tư vấn với bệnh nhân.
          </p>

          <p>
            Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ đội ngũ Pomera.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="color:#666;font-size:12px;margin:0">
            Email này được gửi tự động từ hệ thống Pomera. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
        }).catch(console.error);
      }
    } else if (status === "frozen") {
      sendMail({
        to: email,
        subject: "Pomera: Tài khoản bác sĩ tạm thời bị khóa",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6">
            <h2 style="margin:0 0 12px">⚠️ Tài khoản tạm thời bị khóa</h2>

            <p>Chào <b>${fullName}</b>,</p>

            <p>
              Tài khoản bác sĩ của bạn trên <b>Pomera</b> hiện đang ở trạng thái <b>tạm khóa (frozen)</b>.
            </p>

            <p>
              Vui lòng liên hệ bộ phận hỗ trợ để được hướng dẫn mở lại tài khoản.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
            <p style="color:#666;font-size:12px;margin:0">
              Email này được gửi tự động. Vui lòng không trả lời.
            </p>
          </div>
        `,
      }).catch(console.error);
    }

    return res.json({
      message:
        "Cập nhật trạng thái thành công. Đã gửi thông báo qua email cho bác sĩ.",
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
