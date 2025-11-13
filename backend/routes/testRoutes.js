import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getTests,
  getTestByCode,
  createTest,
} from "../controllers/testController.js";

const router = express.Router();

// User Management Routes
router.get("/", getTests);
router.get("/:code", getTestByCode);
router.post("/", createTest);

export default router;
