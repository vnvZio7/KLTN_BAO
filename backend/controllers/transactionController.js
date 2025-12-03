import { success } from "zod";
import Transaction from "../models/transaction.model.js";
// @desc    Get all transactions (Admin only)
// @route   GET /api/transactions/
// @access  Private (Admin)
const getTransactions = async (req, res) => {
  try {
    // const transactions = await Transaction.find({ userId: req.user._id })
    //   .populate({
    //     path: "doctorId",
    //     populate: {
    //       path: "accountId",
    //       model: "Account",
    //       select: "-password",
    //     },
    //   })
    //   .sort({
    //     createdAt: -1,
    //   });
    const transactions = await Transaction.find()
      .populate({
        path: "roomId",
        match: { userId: req.user._id }, // lọc ngay trong populate
        populate: {
          path: "doctorId",
          model: "Doctor",
          populate: {
            path: "accountId",
            model: "Account",
            select: "-password",
          },
        },
      })

      .sort({
        createdAt: -1,
      });
    console.log(transactions);
    res.json({ transactions });
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

const updateTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Transaction.findByIdAndUpdate(
      id,
      { $set: { roomId: req.body.roomId } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction không tồn tại" });
    }

    res.json({
      message: "Cập nhật thành công",
      transaction: updated,
    });
  } catch (err) {
    console.error("updateTransaction error:", err);
    return res.status(500).json({
      message: "Lỗi server khi cập nhật transaction",
      error: err.message,
    });
  }
};
export { getTransactions, getTransactionByCode, updateTransactions };
