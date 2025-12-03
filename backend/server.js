import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import groqRoutes from "./routes/groqRoutes.js";
import exerciseTemplateRoutes from "./routes/exerciseTemplateRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import testResultRoutes from "./routes/testResultRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import homeworkAssignmentRoutes from "./routes/homeworkAssignmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { app, server } from "./config/socket.js";

dotenv.config();
// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Connect Database

await connectDB();

// Middleware
app.use(express.json());
//Routes
app.get("/", (req, res) => {
  res.send("Hello World! Welcome to Backend");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/groq", groqRoutes);
app.use("/api/exercises", exerciseTemplateRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/testresult", testResultRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/homework-assignments", homeworkAssignmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

//Start Server
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: ${PORT} `);
});
