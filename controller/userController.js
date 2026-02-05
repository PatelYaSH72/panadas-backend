import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Tool from "../models/AiToolsModel.js";
import cloudinary from "../config/cloudinary.js";
import nodemailer from "nodemailer";
import RsourcesModel from "../models/RsourcesModel.js";


export const userSignup = async (req, res) => {
  console.log("run");
  try {
    const { name, email, password } = req.body;

    // 1️⃣ All fields required
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // 3️⃣ Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 4️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 5️⃣ Password encrypt (hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 7️⃣ Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 8️⃣ Success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ All fields required
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // 3️⃣ Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id; // token se
    const { toolId } = req.body;

    const user = await User.findById(userId);

    const isFav = user.favorites.includes(toolId);

    if (isFav) {
      user.favorites.pull(toolId);
    } else {
      user.favorites.push(toolId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFav,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleSaved = async (req, res) => {
  try {
    const userId = req.user.id; // token se
    const { toolId } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const tool = await Tool.findById(toolId);
    if (!tool) throw new Error("Tool not found");

    const isSaved = user.savedTools.includes(toolId);

    if (isSaved) {
      // Remove from saved
      user.savedTools.pull(toolId);
      tool.savedCount = (tool.savedCount || 1) - 1; // savedCount kam karo
    } else {
      // Add to saved
      user.savedTools.push(toolId);
      tool.savedCount = (tool.savedCount || 0) + 1; // savedCount badhao
    }

    await user.save();
    await tool.save();

    res.json({
      success: true,
      isSaved: !isSaved,
      savedCount: tool.savedCount, // updated count return karo
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const dashBoradData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // 1️⃣ USER + SAVED TOOLS (populate)
    const user = await User.findById(userId)
      .select("name email createdAt savedTools image")
      .populate({
        path: "savedTools",
        select: "name category image",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ USER KE SUBMITTED TOOLS
    const submittedToolsDB = await Tool.find({ userId })
      .select("name isPublished createdAt");

    // 3️⃣ FORMAT: SUBMITTED TOOLS
    const submittedTool = submittedToolsDB.map((tool) => ({
      id: tool._id,
      name: tool.name,
      status:
        tool.isPublished === "approved"
          ? "Approved"
          : tool.isPublished === "rejected"
          ? "Rejected"
          : "Pending",
      date: tool.createdAt,
    }));

    // 4️⃣ FORMAT: SAVED TOOLS
    const savedTool = user.savedTools.map((tool) => ({
      id: tool._id,
      name: tool.name,
      category: tool.category?.[0] || "General",
      image: tool.image,
    }));

    // 5️⃣ FINAL RESPONSE (🔥 EXACT FORMAT)
    return res.json({
      success: true,
      name: user.name,
      email: user.email,
      joined: user.createdAt,
      image: user.image,
      avatar:
        "https://img.freepik.com/premium-vector/round-man-character-mockup-icon-flat-color-round-man-icon-blue-tshirt-brown-hair-character-template-vector-icon_774778-2418.jpg",
      totalSaved: savedTool.length,
      totalSubmitted: submittedTool.length,
      submittedTools: submittedTool,
      savedTools: savedTool,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Dashboard data fetch failed",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { name, email } = req.body;

    // user find karo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==== TEXT FIELDS UPDATE ====
    if (name) user.name = name;
    if (email) user.email = email;
    // if (role) user.role = role;

    // ==== IMAGE UPDATE (Cloudinary) ====
   if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "user_avatars",
        }
      );

      user.image = uploadResult.secure_url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

export const getUserData = async (req, res) => {
  try {

    const userId = req.user._id;

    const user = await User.findById(userId)

    if (!user) {
      res.status(404).json({success:false, message:"User Not Defined"})
    }

    res.status(200).json({
      success: true,
      user})
    
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const sendEmail = async (req, res) => {

   const { name, email, subject, message, type, severity } = req.body;

   console.log("aa");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // 1️⃣ Mail to ADMIN
    await transporter.sendMail({
  from: `"Pandas Learner" <${process.env.EMAIL_USER}>`,
  to: process.env.ADMIN_EMAIL,
  subject: `📩 Pandas Learner | ${type.toUpperCase()} - ${subject}`,
  html: `
  <div style="font-family:Arial, sans-serif; background:#f0f4f8; padding:20px">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; transition:all 0.2s ease-in-out;">
      
      <div style="background:#4f46e5; color:white; padding:20px;">
        <h2 style="margin:0; font-size:22px;">📌 Pandas Learner</h2>
        <p style="margin:5px 0 0; font-size:14px;">New ${type.toUpperCase()} Received</p>
      </div>

      <div style="padding:20px; color:#1f2937; line-height:1.6;">
        <div style="margin-bottom:12px;"><strong>Name:</strong> ${name}</div>
        <div style="margin-bottom:12px;"><strong>Email:</strong> ${email}</div>
        <div style="margin-bottom:12px;"><strong>Severity:</strong> ${severity}</div>

        <div style="background:#f9fafb; border-left:4px solid #4f46e5; border-radius:8px; padding:12px;">
          <strong>Message:</strong>
          <p style="margin-top:6px;">${message}</p>
        </div>
      </div>

      <div style="background:#f3f4f6; color:#6b7280; text-align:center; padding:12px; font-size:12px;">
        © ${new Date().getFullYear()} Pandas Learner • Admin Panel
      </div>
    </div>
  </div>
  `
});


    // 2️⃣ Auto-reply to USER
   await transporter.sendMail({
  from: `"Pandas Learner Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "✅ Pandas Learner | We received your message",
  html: `
  <div style="font-family:Arial, sans-serif; background:#f0f4f8; padding:20px">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; transition:all 0.2s ease-in-out;">

      <div style="background:#2563eb; color:white; padding:20px;">
        <h2 style="margin:0; font-size:22px;">🎓 Pandas Learner</h2>
        <p style="margin:5px 0 0; font-size:14px;">Thank you for reaching out!</p>
      </div>

      <div style="padding:20px; color:#1f2937; line-height:1.6;">
        <p>Hi <strong>${name}</strong>,</p>

        <p>Thanks for submitting your <strong>${type}</strong>. Our team has received it successfully and will review it shortly.</p>

        <div style="background:#f9fafb; border-left:4px solid #16a34a; border-radius:8px; padding:12px; margin-top:12px;">
          <strong>Your Message:</strong>
          <p style="margin-top:6px;">${message}</p>
        </div>

        <p style="margin-top:20px;">We appreciate you helping us improve <strong>Pandas Learner</strong> 🚀</p>

        <p>Regards,<br/><strong>Pandas Learner Support Team</strong></p>
      </div>

      <div style="background:#f3f4f6; color:#6b7280; text-align:center; padding:12px; font-size:12px;">
        © ${new Date().getFullYear()} Pandas Learner • Learn • Build • Grow
      </div>
    </div>
  </div>
  `
});


    res.json({ success: true });

  } catch (error) {
    console.error("MAIL ERROR 👉", error);
    res.status(500).json({ success: false });
  }

}

// user model
// import Resource from "../models/Resource.js"; // resource model

export const bookmarkedData = async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user id
    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // 1️⃣ Find user by id and populate bookmarks
    const user = await User.findById(userId).populate({
      path: "bookmarks", // bookmarks field
      model: "Resources", // populate from Resource collection
      populate: { path: "reviews", model: "Review", },
       select: "_id icon name slug short_description rating bookmarksCount reviews isBookmarked", // optional: populate reviews if needed
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Get bookmarked resources
    const bookmarkedResources = user.bookmarks;

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      data: bookmarkedResources,
    });
  } catch (error) {
    console.error("Error fetching bookmarked data:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// export default {userSignup, loginUser};
