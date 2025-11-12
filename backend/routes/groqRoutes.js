import express from "express";
import { protect } from "..//middlewares/authMiddleware";
import { computeScoreFromDefinition } from "../controllers/testController";
import TestResult from "../models/testResult.model";
import User from "../models/user.model";
import Doctor from "../models/doctor.model";
import { matchDoctorsAIOnly } from "../utils/callAPIGroq";
import {
  gadBand,
  phqBand,
  pickSuggestedRole,
  trimDoctorForPrompt,
} from "../utils/helper";

const router = express.Router();

// User Management Routes
router.post("/", matchDoctorsAIOnly);

export default router;
