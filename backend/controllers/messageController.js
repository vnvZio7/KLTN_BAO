import Message from "../models/message.model.js";
import Room from "../models/room.model.js";

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("accountId");
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "roomId là bắt buộc" });
    }

    if (!content && !fileUrl) {
      return res
        .status(400)
        .json({ message: "Nội dung hoặc fileUrl phải có ít nhất một" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const role = req.account.role; // "user" | "doctor" | "admin"...

    let senderType = "system";
    if (role === "doctor") senderType = "doctor";
    else if (role === "user") senderType = "user";

    const message = await Message.create({
      roomId,
      senderType,
      content: content || "",
      read: false,
    });

    // (Tuỳ chọn) Cập nhật lastMessage trong Room nếu bạn có field này
    try {
      await Room.findByIdAndUpdate(roomId, {
        lastMessageAt: new Date(),
        lastMessage: content || "",
      });
    } catch (e) {
      console.warn("Không update được Room, kiểm tra Room model sau >>>", e);
    }

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sendMessage >>>", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const getMessageByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({
      roomId,
    }).lean();
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { getMessages, sendMessage, getMessageByRoomId };
