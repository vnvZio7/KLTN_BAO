import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getSessions,
  getSessionByAppointmentId,
  createSession,
  updateSession,
  getSessionsThisWeek,
} from "../controllers/sessionController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// User Management Routes
router.get("/", getSessions);
router.get("/:id", protect, getSessionByAppointmentId);
router.get("/week/:userId", getSessionsThisWeek);
router.post("/", protect, createSession);
router.patch(
  "/:appointmentId",
  protect,
  upload.array("recordings"),
  updateSession
);

export default router;
