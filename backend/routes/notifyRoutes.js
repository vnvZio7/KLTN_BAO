import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  getNotificationById,
  updateRead,
  updateReadOne,
} from "../controllers/notificationController.js";

const router = express.Router();

// User Management Routes
router.get("/admin", protect, adminOnly, getNotifications);
router.get("/", protect, getNotificationById);
router.patch("/mark-all-read", protect, updateRead);
router.patch("/mark-read/:id", protect, updateReadOne);

export default router;
