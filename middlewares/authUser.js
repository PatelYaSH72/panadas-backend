import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authUser = async (req, res, next) => {
  try {
    // 1️⃣ Token get karo
    const token = req.headers.token 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // 2️⃣ Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ User fetch from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4️⃣ req me attach karo
    req.user = user;

    next(); // ✅ allow request
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authUser;
