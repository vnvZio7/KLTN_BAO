import express from "express";
import { getDataSePay, webhooks } from "../controllers/paymentController.js";

const router = express.Router();

// Booking Management Routes
router.get("/sepay", getDataSePay);
router.post("/webhook", webhooks);
router.get("/check", (req, res) => {
  res.json("hello");
});

export default router;
