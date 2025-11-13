import express from "express";
import { protect } from "..//middlewares/authMiddleware.js";
import { computeScoreFromDefinition } from "../controllers/testController.js";
import TestResult from "../models/testResult.model.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { matchDoctorsAIOnly } from "../utils/callAPIGroq.js";
import {
  gadBand,
  phqBand,
  pickSuggestedRole,
  trimDoctorForPrompt,
} from "../utils/helper.js";

const router = express.Router();

// User Management Routes
router.post("/", matchDoctorsAIOnly);

export default router;
