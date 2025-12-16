import express from "express";
import { adminOnly, protect } from "..//middlewares/authMiddleware.js";
import {
  getUsers,
  getUserByDoctorId,
  updateUser,
  getUsersSwitchDoctor,
  updateSwitchDoctorId,
  updateRetest,
  updateUserBeforeReTest,
  updateFreeCallUser,
} from "../controllers/userController.js";

const router = express.Router();

// User Management Routes
router.get("/", getUsers);
router.get("/switch-doctor", getUsersSwitchDoctor);
router.get("/doctor", protect, getUserByDoctorId);
router.patch("/", protect, updateUser);
router.patch("/update", protect, updateSwitchDoctorId);
router.patch("/retest/", protect, updateUserBeforeReTest);
router.patch("/retest/:id", protect, updateRetest);
router.patch("/free-call", protect, updateFreeCallUser);

export default router;
