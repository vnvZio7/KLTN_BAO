import axios from "axios";
import Transaction from "../models/transaction.model.js";
const getDataSePay = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://my.sepay.vn/userapi/bankaccounts/details/26008",
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );
    res.json({ success: true, bankaccount: data.bankaccount });

    // res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
function isObjectId(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

const webhooks = async (req, res) => {
  try {
    const data = req.body;
    const transaction = await Transaction.create({
      code: data.code,
      amount: data.transferAmount,
      status: "paid",
      paid: data.transactionDate,
    });
    return res.status(200).json({ success: true, message: "OK" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { getDataSePay, webhooks };
