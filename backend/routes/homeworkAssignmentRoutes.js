import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getHomeworkAssignments,
  createHomeworkAssignmentByDoctor,
  getHomeworkAssignmentById,
} from "../controllers/homeworkAssignmentController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// User Management Routes
router.get("/", getHomeworkAssignments);
router.get("/:id", getHomeworkAssignmentById);
router.post("/", upload.array("attachments"), createHomeworkAssignmentByDoctor);

export default router;
