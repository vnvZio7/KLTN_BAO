// routes/roomRoutes.js
import express from "express";
import Room from "../models/room.model.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT auth middleware
import userModel from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";

const router = express.Router();

// 🧩 Join Room (kiểm tra quyền)
// router.get("/:id", protect, async (req, res) => {
//   const room = await Room.findById(req.params.id);
//   if (!room) return res.status(404).send("Room not found");
//   const { _id, role } = req.user;
//   let valid = false;
//   if (role === "user") {
//     const user = await userModel.findOne({ accountId: _id });
//     console.log(user);
//     if (user && user._id.toString() === room.userId.toString()) valid = true;
//   } else if (role === "doctor") {
//     const doctor = await Doctor.findOne({ accountId: _id });
//     if (doctor && doctor._id.toString() === room.doctorId.toString())
//       valid = true;
//   }

//   if (!valid) return res.status(403).send("Not allowed to join this room");
//   res.json(room);
// });

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
