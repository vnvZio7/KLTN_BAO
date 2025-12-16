import mongoose from "mongoose";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { uploadManyBuffers } from "../utils/uploadCloudinary.js";
import doctorModel from "../models/doctor.model.js";

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    const data = sessions.map((e) => e);
    res.json(data);
    // res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getSessionsThisWeek = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    // -------------------------------
    // 🗓️ Tính tuần hiện tại (Mon → Sun)
    // -------------------------------
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon …

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - ((day + 6) % 7)); // đưa về thứ Hai

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7); // Chủ nhật + 23:59

    // ------------------------------------------
    // 🔍 Lấy session của user trong tuần hiện tại
    // ------------------------------------------
    const sessions = await Session.aggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      { $unwind: "$appointment" },

      {
        $lookup: {
          from: "rooms",
          localField: "appointment.roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },

      // Lọc đúng userId
      {
        $match: {
          "room.userId": new mongoose.Types.ObjectId(userId),
          startedAt: { $gte: weekStart, $lt: weekEnd },
        },
      },

      { $sort: { startedAt: -1 } },
    ]);

    res.json({
      success: true,
      count: sessions.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getSessionByAppointmentId = async (req, res) => {
  try {
    const sessions = await Session.find({ appointmentId: req.params.id });
    if (!sessions)
      return res.status(404).json({ message: "Không tìm thấy bài session" });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    let session = await Session.findOne({ appointmentId })
      .populate({
        path: "appointmentId",
        populate: {
          path: "roomId",
        },
      })
      .lean();
    if (!session) {
      session = await Session.create({
        appointmentId,
        recordingUrls: [],
      });
    }
    console.log(session);
    const userId = session.appointmentId.roomId.userId;
    const user = await User.findById(userId).populate("currentDoctorId");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (user.freeCall === 1) {
      user.freeCall = 0; // hết lượt free
    } else if (user.freeCall === 0) {
      const pill = user.walletBalance - user.currentDoctorId.pricePerWeek;
      if (user.firstCallInWeek && pill >= 0) {
        const doctor = await doctorModel.findByIdAndUpdate(
          user.currentDoctorId,
          {
            $set: { walletBalance: user.currentDoctorId.pricePerWeek },
          }
        );
        console.log(doctor);
        user.walletBalance = pill;
        user.firstCallInWeek = false;
      }
    }

    await user.save();
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    let recordingUrls = [];
    if (req.files?.length) {
      recordingUrls = await uploadManyBuffers(req.files, "pomera/recordings/");
    }
    // Lấy / tạo session theo appointmentId (vì appointmentId là unique)
    let session = await Session.findOne({ appointmentId });

    const now = new Date();

    // Tính durationSec nếu có startedAt
    let durationSec = session.durationSec || 0;
    if (session.startedAt) {
      durationSec = Math.floor((now - session.startedAt) / 1000);
    }

    // Push thêm url vào list recordingUrls
    if (recordingUrls.length) {
      session.recordingUrls.push(...recordingUrls);
    }

    session.endedAt = now;
    session.durationSec = durationSec;

    await session.save();

    res.status(200).json({ message: "update session thành công!", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export {
  getSessions,
  getSessionByAppointmentId,
  createSession,
  updateSession,
  getSessionsThisWeek,
};
