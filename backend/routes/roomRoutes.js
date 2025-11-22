// routes/roomRoutes.js
import express from "express";
import Room from "../models/room.model.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT auth middleware
import { createRoom, getRoom } from "../controllers/roomController.js";

const router = express.Router();

router.get("/", protect, getRoom);
router.post("/", protect, createRoom);
export default router;
