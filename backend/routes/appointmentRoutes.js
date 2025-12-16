import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getAppointmentsByRoomId,
  createAppointment,
  updateAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/:roomId", getAppointmentsByRoomId);
router.post("/", protect, createAppointment);
router.patch("/:id", protect, updateAppointment);

export default router;
