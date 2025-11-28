import express from "express";
import { adminOnly, protect } from "..//middlewares/authMiddleware.js";
import {
  getAccounts,
  getAllTransactions,
  updateApproval,
} from "../controllers/adminController.js";

const router = express.Router();

// // Admin Management Routes
// router.get("/accounts", protect, adminOnly, getAccounts);
router.get("/accounts", getAccounts);
router.get("/transactions", getAllTransactions);
router.patch("/doctors/:id/approval", protect, adminOnly, updateApproval);

export default router;
