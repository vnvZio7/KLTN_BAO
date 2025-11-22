import express from "express";
import { protect } from "..//middlewares/authMiddleware.js";

import { matchDoctorsAIOnly } from "../utils/callAPIGroq.js";

const router = express.Router();

// User Management Routes
router.post("/", matchDoctorsAIOnly);

export default router;
