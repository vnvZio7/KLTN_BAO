import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import {
  getExerciseTemplates,
  getExerciseTemplateById,
  createExerciseTemplate,
} from "../controllers/exerciseTemplateController";

const router = express.Router();

// User Management Routes
router.get("/", getExerciseTemplates);
router.get("/:id", getExerciseTemplateById);
router.post("/", createExerciseTemplate);

export default router;
