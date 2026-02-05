import "dotenv/config";
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js'
// import connectCloudinary from './config/cloudinary.js'
import 'dotenv/config'
import adminRouter from './routes/adminRouter.js'
import userRouter from "./routes/userRoutes.js";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";


const app = express()

const port = process.env.PORT || 4000
connectDB()
// connectCloudinary()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get('/',(req,res)=>{
  res.send('API WORKING Great')
})
app.use('/api/admin',adminRouter)
app.use('/api/user',userRouter)
// app.use('/api/search',globalSearch)


app.listen(port,()=>{
  console.log("Server started",port)
})