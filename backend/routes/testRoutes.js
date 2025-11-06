import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import {
  getTests,
  getTestByCode,
  createTest,
} from "../controllers/testController";

const router = express.Router();

// User Management Routes
router.get("/", getTests);
router.get("/:code", getTestByCode);
router.post("/", createTest);

export default router;
