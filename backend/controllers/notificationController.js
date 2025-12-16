import Notification from "../models/notification.model.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ admin: true });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user?._id }, { doctorId: req.user?._id }],
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateReadOne = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      $set: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateRead = async (req, res) => {
  try {
    const { role } = req.account;

    let filter = { read: false };

    if (role === "user") {
      filter.userId = req.user._id;
      filter.admin = { $ne: true }; // không lấy admin broadcast
    }

    if (role === "doctor") {
      filter.doctorId = req.user._id;
      filter.admin = { $ne: true };
    }

    if (role === "admin") {
      filter.admin = true;
    }
    await Notification.updateMany(filter, {
      $set: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createNotification = async ({
  userId = null,
  doctorId = null,
  admin = false,
  title1 = "No title",
  message = "Message fail",
  type = "system",
}) => {
  try {
    console.log(userId, doctorId, admin, title1, message, type);
    const notification = await Notification.create({
      userId,
      doctorId,
      admin,
      title: title1,
      message,
      type,
    });
    console.log(notification);
  } catch (error) {
    return error.message;
  }
};

export {
  getNotifications,
  getNotificationById,
  createNotification,
  updateRead,
  updateReadOne,
};
