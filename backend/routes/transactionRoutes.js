import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  getTransactions,
  getTransactionByCode,
  updateTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

// Transaction Management Routes
router.get("/", protect, getTransactions);
router.get("/:code", getTransactionByCode);
router.patch("/:id", protect, updateTransactions);

export default router;
