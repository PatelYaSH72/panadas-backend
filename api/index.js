// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import connectDB from "../config/mongodb.js";
// import adminRouter from "../routes/adminRouter.js";
// import userRouter from "../routes/userRoutes.js";
// import Groq from "groq-sdk";

// const app = express();

// // DB connect
// connectDB();

// // middlewares
// app.use(express.json());
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// // groq
// export const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// // routes
// app.get("/", (req, res) => {
//   res.send("API WORKING Great 🚀");
// });

// app.use("/api/admin", adminRouter);
// app.use("/api/user", userRouter);

// // ❌ REMOVE app.listen
// // Vercel server khud handle karega

// export default app;
