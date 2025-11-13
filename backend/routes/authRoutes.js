import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";
import { upload } from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  registerUser
);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

export default router;
