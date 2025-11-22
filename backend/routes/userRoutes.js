import express from "express";
import { adminOnly, protect } from "..//middlewares/authMiddleware.js";
import {
  getUsers,
  getUserByDoctorId,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

// User Management Routes
router.get("/", getUsers);
router.get("/doctor", protect, getUserByDoctorId);
router.patch("/", protect, updateUser);

export default router;
