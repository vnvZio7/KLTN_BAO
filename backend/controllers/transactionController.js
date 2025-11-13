import { success } from "zod";
import Transaction from "../models/transaction.model.js";
// @desc    Get all transactions (Admin only)
// @route   GET /api/transactions/
// @access  Private (Admin)
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionByCode = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ code: req.params.code });
    if (!transaction)
      return res.json({
        success: false,
        message: "Bạn chưa hoàn tất thanh toán!",
      });
    return res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getTransactions, getTransactionByCode };
