import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import {
  getTransactions,
  getTransactionByCode,
} from "../controllers/transactionController";

const router = express.Router();

// Transaction Management Routes
router.get("/", getTransactions);
router.get("/:code", getTransactionByCode);

export default router;
