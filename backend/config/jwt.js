import jwt from "jsonwebtoken";
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "7d";

export const generateToken = (account) => {
  return jwt.sign({ id: account._id, role: account.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
