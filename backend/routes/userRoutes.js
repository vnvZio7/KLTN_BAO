import express from "express";
import { adminOnly, protect } from "..//middlewares/authMiddleware.js";
import { getUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// User Management Routes
router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
