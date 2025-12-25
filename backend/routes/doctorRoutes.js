import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { getDoctorByIds, getDoctors } from "../controllers/doctorController.js";

const router = express.Router();

// User Management Routes
router.get("/", protect, getDoctors);
router.post("/doctorIds", getDoctorByIds);

export default router;
