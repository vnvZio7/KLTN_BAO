// routes/messageRoutes.js
import express from "express";
import Message from "../models/message.model.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT auth middleware
import {
  getMessageByRoomId,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/", protect, getMessages);
router.get("/:roomId", getMessageByRoomId);
router.post("/", protect, sendMessage);
export default router;
