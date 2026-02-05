import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";

import adminRouter from "./routes/adminRouter.js";
import userRouter from "./routes/userRoutes.js";

import Groq from "groq-sdk";

const app = express();
const port = process.env.PORT || 4000;

// 🔥 DB connect
connectDB();

// 🔥 middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// 🔥 Groq export (for AI)
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🔥 test route
app.get("/", (req, res) => {
  res.send("API WORKING Great 🚀");
});

// 🔥 routes
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// 🔥 IMPORTANT (render production)
app.listen(port, "0.0.0.0", () => {
  console.log("Server started on port " + port);
});
