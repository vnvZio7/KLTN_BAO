import express from "express";
import { adminOnly, protect } from "..//middlewares/authMiddleware";
import { getUsers, getUserById } from "../controllers/userController";

const router = express.Router();

// User Management Routes
router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
