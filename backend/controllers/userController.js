import roomModel from "../models/room.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notificationController.js";
// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("accountId").select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserByDoctorId = async (req, res) => {
  try {
    const users = await User.find({ currentDoctorId: req.user._id })
      .populate({
        path: "accountId",
        select: "-password",
      })
      .populate({
        path: "testHistory",
      });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      testHistory,
      dominantSymptom,
      doctorIds,
      currentDoctorId,
      walletBalance,
      lastGAD7Score,
      lastPHQ9Score,
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          testHistory,
          dominantSymptom,
          doctorIds,
          currentDoctorId,
          lastGAD7Score,
          lastPHQ9Score,
          walletBalance,
        },
      },
      { new: true } // trả về document sau khi update
    );
    res.status(201).json({ message: "Đã cập nhật user thành công!", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateUserAfterReTest = async (req, res) => {
  try {
    const { testHistory, lastGAD7Score, lastPHQ9Score } = req.body;
    const user = await User.findById(req.user._id);
    if (user.retest === false) {
      return res
        .status(500)
        .json({ message: "Bạn đã nộp bài test trước đó rồi" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        lastGAD7Score,
        lastPHQ9Score,
        retest: false,
      },
      $push: {
        // ✅ khuyến nghị để không bị trùng
        testHistory: { $each: testHistory },
      },
    });

    await createNotification({
      doctorId: user.currentDoctorId,
      title1: "Hoàn thành làm lại bài test",
      message: `Người dùng "${req.account.fullName}" vừa hoàn thành làm lại bài test. `,
    });
    res.status(201).json({ message: "Đã cập nhật user thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateFreeCallUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        freeCall: 1,
      },
    });
    res.status(201).json({ message: "Đã cập nhật user thành công!", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsersSwitchDoctor = async (req, res) => {
  try {
    // const users = await User.find({
    //   switchDoctorId: { $exists: true, $ne: null },
    // })
    //   .populate("accountId")
    //   .populate({
    //     path: "switchDoctorId",
    //     populate: {
    //       path: "accountId",
    //       model: "Account",
    //       select: "-password", // nếu muốn ẩn password của account bác sĩ
    //     },
    //   })
    //   // populate currentDoctorId + accountId của bác
    //   .populate({
    //     path: "currentDoctorId",
    //     populate: {
    //       path: "accountId",
    //       model: "Account",
    //       select: "-password",
    //     },
    //   });
    // 1. Tìm tất cả user có ÍT NHẤT MỘT yêu cầu "pending"
    const users = await User.find({
      switchDoctor: { $exists: true, $ne: [] },
    })
      .populate("accountId", "-password")
      .populate({
        path: "switchDoctor.currentDoctorId",
        populate: {
          path: "accountId",
          model: "Account",
          select: "-password",
        },
      })
      .populate({
        path: "switchDoctor.switchDoctorId",
        populate: {
          path: "accountId",
          model: "Account",
          select: "-password",
        },
      })
      .lean();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const chooseDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.currentDoctorId = doctorId;

    // 3. Tạo Room nếu chưa có

    let room = await roomModel.findOne({
      userId: user._id,
      doctorId,
    });

    if (!room) {
      room = await roomModel.create({
        userId: user._id,
        doctorId,
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
    await createNotification({
      userId: req.user._id,
      title1: "Kết nối thành công tới bác sĩ",
      message:
        "Hệ thống đã kết nối thành công bạn với bác sĩ. Xem chi tiết ở trang thông tin bác sĩ",
      type: "system",
    });
    await createNotification({
      doctorId,
      title1: "Bệnh nhân mới",
      message: `Bạn vừa được ghép nối với một bệnh nhân - ${req.account.fullName}`,
      type: "system",
    });

    return res.json({
      success: true,
      user,
      room,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSwitchDoctorId = async (req, res) => {
  try {
    const { currentDoctorId, switchDoctorId, status, reason } = req.body;
    const newRequest = {
      switchDoctorId,
      currentDoctorId,
      switchDoctorStatus: status || "pending",
      reason: reason || "",
    };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          switchDoctor: newRequest,
        },
      },
      { new: true } // trả về document sau khi update
    );
    await createNotification({
      admin: true,
      title1: "Yêu cầu đổi bác sĩ",
      message: `Người dùng "${req.account.fullName}" vừa gửi yêu cầu đổi bác sĩ. Hãy kiểm tra ngay`,
    });
    res.status(201).json({ message: "Đã cập nhật user thành công!", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateRetest = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.account.role === "doctor") {
      const user = await User.findByIdAndUpdate(id, {
        $set: {
          retest: true,
        },
      });
      if (user) {
        await createNotification({
          userId: id,
          title1: "Làm lại bài test",
          message: `Bác sĩ vừa gửi yêu cầu làm bài test đến bạn. Hãy hoàn thiện trước buổi gặp mặt sắp tới`,
          type: "test",
        });
        return res
          .status(200)
          .json({ message: `Đã gửi yêu cầu làm lại bài test đến bệnh nhân.` });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { userId, content } = req.body;
    const note = { content };
    console.log(userId, content);
    const user = await User.findByIdAndUpdate(userId, {
      $push: {
        notes: note,
      },
    });

    return res.status(200).json({ message: `Đã cập nhật ghi chú thành công` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getUsers,
  getUserByDoctorId,
  updateUser,
  getUsersSwitchDoctor,
  updateSwitchDoctorId,
  updateRetest,
  updateUserAfterReTest,
  updateFreeCallUser,
  addNote,
  chooseDoctor,
};
