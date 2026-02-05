import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import AdiminModel from "../models/AdiminModel.js";
import jwt from 'jsonwebtoken';
import AiToolsModel from "../models/AiToolsModel.js";
import User from "../models/userModel.js";


const addAdmin = async () => {
  const password = "Admin@123";
  const hashed = await bcrypt.hash(password, 10);

  await mongoose.connect(process.env.MONGODB_URI);

  await AdiminModel.create({
    email: "superadmin@gmail.com",
    password: hashed,
    role: "superAdmin",
  });

  console.log("Super Admin Created");
  process.exit();
};

const loginAdmin = async (req, res) => {


  const {email, password} = req.body;

  const admin = await AdiminModel.findOne({email})

  if(!admin){
    return res.json({success:false, message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password)

  if(!isMatch){
    return res,json({sucess:false, message: "Wrong Password"});
  }

  const aToken = jwt.sign({id:admin._id, role: admin.role},process.env.JWT_SECRET, {expiresIn:"7d"})

  res.json({success: true, aToken, role: admin.role})
}

export const dashBoradData = async (req, res) => {
  try {

    // 1️⃣ Total Users
    const totalUsers = await User.countDocuments();

    // 2️⃣ Total Tools
    const totalTools = await AiToolsModel.countDocuments();

    // 3️⃣ Active Tools
    const activeTools = await AiToolsModel.countDocuments({ isPublished: "approved" });

    // 4️⃣ Growth Rate (Last 30 days users)
    const lastMonthDate = new Date();
    lastMonthDate.setDate(lastMonthDate.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: lastMonthDate }
    });

    const growthRate =
      totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0;

    // 5️⃣ Pending Tools with Author Name
    const pendingTools = await AiToolsModel.find({ isPublished: "pending" })
      .populate("userId", "name") // userId se user ka name
      .select("name userId createdAt");

    const pendingToolsData = pendingTools.map(tool => ({
      toolId: tool._id,
      toolName: tool.name,
      authorName: tool.userId?.name,
      authorId: tool.userId?._id,
      date: tool.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTools,
        activeTools,
        growthRate: `${growthRate}%`,
        pendingTools: pendingToolsData
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Dashboard data fetch failed"
    });
  }
};

export const getApproved = async (req, res) => {
  try {
    const { toolId } = req.body; // frontend se aayega

    if (!toolId) {
      return res.status(400).json({
        success: false,
        message: "Tool ID is required"
      });
    }

    const tool = await AiToolsModel.findById(toolId);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found"
      });
    }

    // ✅ Approve Tool
    tool.isPublished = "approved";    

    await tool.save();

    return res.status(200).json({
      success: true,
      message: "Tool approved & published successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Tool approval failed"
    });
  }
};

export const getRejected = async (req, res) => {

  console.log(req.body.toolId)
  
  try {
    const { toolId } = req.body; // frontend se aayega

    if (!toolId) {
      return res.status(400).json({
        success: false,
        message: "Tool ID is required"
      });
    }

    const tool = await AiToolsModel.findById(toolId);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found"
      });
    }

    
    tool.isPublished = "rejected";    

    await tool.save();

    return res.status(200).json({
      success: true,
      message: "Tool approved & published successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Tool approval failed"
    });
  }
};

export default loginAdmin
