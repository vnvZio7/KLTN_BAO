// routes/roomRoutes.js
import express from "express";
import Room from "../models/room.model.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT auth middleware
import userModel from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";

const router = express.Router();

// Authorize join
router.post("/:id/join", protect, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Room not found" });

  const { _id } = req.user;
  console.log(room.userId !== _id, room.doctorId !== _id);
  if (
    String(room.userId) !== String(_id) &&
    String(room.doctorId) !== String(_id)
  )
    return res.status(403).json({ message: "No permission" });

  res.json({ ok: true });
});

export default router;
