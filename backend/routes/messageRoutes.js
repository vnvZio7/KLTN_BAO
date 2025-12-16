// routes/messageRoutes.js
import express from "express";
import Message from "../models/message.model.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT auth middleware
import {
  getMessageByRoomId,
  getMessages,
  sendMessage,
  readMessageByRoomId,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/", protect, getMessages);
router.get("/:roomId", getMessageByRoomId);
router.post("/", protect, sendMessage);
router.patch("/:roomId", protect, readMessageByRoomId);
export default router;
