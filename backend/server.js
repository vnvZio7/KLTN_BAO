require("dotenv").config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import roomRoutes from "./routes/roomRoutes";
import userRoutes from "./routes/userRoutes";
import testRoutes from "./routes/testRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import groqRoutes from "./routes/groqRoutes";
import exerciseTemplateRoutes from "./routes/exerciseTemplateRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Connect Database
connectDB();

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

//Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: ${PORT} `);
});

// server.js
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// let onlineUsers = {};

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("register", (userId) => {
//     onlineUsers[userId] = socket.id;
//     console.log("Registered user:", userId, socket.id);
//   });

//   socket.on("call-user", ({ from, to, offer }) => {
//     const targetSocket = onlineUsers[to];
//     if (!targetSocket) {
//       socket.emit("user-not-found", { to });
//     }
//     if (targetSocket) {
//       io.to(targetSocket).emit("incoming-call", { from, offer });
//     }
//   });

//   socket.on("answer-call", ({ to, answer }) => {
//     const targetSocket = onlineUsers[to];
//     if (targetSocket) {
//       io.to(targetSocket).emit("call-accepted", { answer });
//     }
//   });

//   socket.on("ice-candidate", ({ to, candidate }) => {
//     const targetSocket = onlineUsers[to];
//     if (targetSocket) {
//       io.to(targetSocket).emit("ice-candidate", { candidate });
//     }
//   });
//   socket.on("end-call", ({ to }) => {
//     const targetSocket = onlineUsers[to];
//     if (targetSocket) {
//       io.to(targetSocket).emit("call-ended");
//     }
//   });
//   socket.on("disconnect", () => {
//     for (let key in onlineUsers) {
//       if (onlineUsers[key] === socket.id) {
//         delete onlineUsers[key];
//         break;
//       }
//     }
//     console.log("User disconnected:", socket.id);
//   });
// });

// server.listen(8080, () => {
//   console.log("Server running on port 8080");
// });

// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// import authRoutes from "./routes/authRoutes";
// import roomRoutes from "./routes/roomRoutes";
// import userRoutes from "./routes/userRoutes";
// import connectDB from "./config/db";

// const app = express();
// // app.use(cors());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// connectDB();
// app.use(express.json()); // Để đọc body json
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/rooms", roomRoutes);

// let onlineUsers = {};

// // io.on("connection", (socket) => {
// //   console.log("User connected:", socket.id);

// //   socket.on("register", (userId) => {
// //     // Xóa socket.id khỏi bất kỳ user nào khác đang dùng
// //     for (let key in onlineUsers) {
// //       if (onlineUsers[key] === socket.id) delete onlineUsers[key];
// //     }

// //     onlineUsers[userId] = socket.id;
// //     console.log("Registered user:", userId, socket.id);
// //     // onlineUsers[userId] = socket.id;
// //     console.log("onlineUsers:", onlineUsers);
// //   });
// //   socket.on("reject-call", ({ toUserId }) => {
// //     const targetSocket = onlineUsers[toUserId];
// //     if (targetSocket) {
// //       io.to(targetSocket).emit("call-rejected");
// //     }
// //   });
// //   socket.on("call-user", ({ fromUserId, toUserId, offer }) => {
// //     const targetSocket = onlineUsers[toUserId];
// //     if (targetSocket) {
// //       io.to(targetSocket).emit("incoming-call", { fromUserId, offer });
// //     }
// //   });

// //   socket.on("answer-call", ({ toUserId, answer }) => {
// //     const targetSocket = onlineUsers[toUserId];
// //     if (targetSocket) {
// //       io.to(targetSocket).emit("call-accepted", { answer });
// //     }
// //   });

// //   socket.on("ice-candidate", ({ toUserId, candidate }) => {
// //     const targetSocket = onlineUsers[toUserId];
// //     if (targetSocket) {
// //       io.to(targetSocket).emit("ice-candidate", { candidate });
// //     }
// //   });

// //   socket.on("end-call", ({ toUserId }) => {
// //     const targetSocket = onlineUsers[toUserId];
// //     if (targetSocket) {
// //       io.to(targetSocket).emit("call-ended");
// //     }
// //   });

// //   socket.on("disconnect", () => {
// //     for (let key in onlineUsers) {
// //       if (onlineUsers[key] === socket.id) {
// //         delete onlineUsers[key];
// //         break;
// //       }
// //     }
// //     console.log("User disconnected:", socket.id);
// //   });
// // });

// const emailToSocketMapping = new Map();
// const socketToEmailMapping = new Map();

// // ====== Socket.io video logic ======
// io.on("connection", (socket) => {
//   console.log("New Connection");
//   socket.on("join-room", (data) => {
//     const { roomId, userId } = data;
//     console.log("User", userId, "Joined room ", roomId);
//     emailToSocketMapping.set(userId, socket.id);
//     socketToEmailMapping.set(socket.id, userId);
//     socket.join(roomId);
//     socket.emit("joined-room", { roomId });
//     socket.broadcast.to(roomId).emit("user-joined", { userId });

//     socket.on("disconnect", () => {
//       socket.to(roomId).emit("user-disconnected", userId);
//     });
//   });

//   socket.on("call-user", (data) => {
//     const { userId, offer } = data;
//     const fromEmail = socketToEmailMapping.get(socket.id);
//     const sockerId = emailToSocketMapping.get(userId);
//     socket.to(sockerId).emit("incomming-call", { from: fromEmail, offer });
//   });

//   socket.on("call-accepted", (data) => {
//     const { userId, ans } = data;
//     const sockerId = emailToSocketMapping.get(userId);
//     socket.to(sockerId).emit("call-accepted", { ans });
//   });
// });

// server.listen(8080, () => {
//   console.log("Server running on port 8080");
// });
