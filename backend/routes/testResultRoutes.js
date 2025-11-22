import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getTestResults,
  getTestResultByCode,
  createTestResult,
} from "../controllers/testResultController.js";

const router = express.Router();

// User Management Routes
router.get("/", getTestResults);
router.get("/:code", getTestResultByCode);
router.post("/", protect, createTestResult);

export default router;
