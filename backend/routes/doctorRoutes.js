import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { getDoctors } from "../controllers/doctorController.js";

const router = express.Router();

// User Management Routes
router.get("/", getDoctors);

export default router;
