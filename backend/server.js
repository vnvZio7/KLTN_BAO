require("dotenv").config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db";

import userRoutes from "./routes/userRoutes";

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
  res.send("Hello World!");
});

app.use("/api/users", userRoutes);

//Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port: ${PORT} `)
);
