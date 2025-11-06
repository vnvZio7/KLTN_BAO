import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController";
import { upload } from "../middlewares/upload";
import { protect } from "../middlewares/authMiddleware";

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
