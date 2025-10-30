import Account from "../models/account.model";
import User from "../models/user.model";
import Doctor from "../models/doctor.model";
const jwt = require("jsonwebtoken");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const account = await Account.findOne({ id: decoded._id }).select(
        "-password"
      );
      req.account = account;
      if (account.role === "user") {
        req.user = await User.findOne({ accountId: account._id });
      } else if (account.role === "doctor") {
        req.user = await Doctor.findOne({ accountId: account._id });
      }
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

// Middleware for Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

module.exports = { protect, adminOnly };
