import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getHomeworkSubmissions,
  createHomeworkSubmission,
  getHomeworkSubmissionById,
  updateFeedback,
} from "../controllers/homeworkSubmissionController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// User Management Routes
router.get("/", getHomeworkSubmissions);
router.get("/:id", getHomeworkSubmissionById);
router.post("/", upload.array("attachments"), createHomeworkSubmission);
router.patch("/:id", updateFeedback);

export default router;
