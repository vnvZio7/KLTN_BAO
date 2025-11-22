import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { getAppointmentsByRoomId } from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/:roomId", getAppointmentsByRoomId);

export default router;
