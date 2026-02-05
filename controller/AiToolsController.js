import AiToolsModel from "../models/AiToolsModel.js";
import slugify from "slugify";
import { logToolToExcel } from "../utils/excelLogger.js";
import userModel from "../models/userModel.js";
import { buildAiToolEmbeddingText, buildResourceEmbeddingText } from "../utils/buildEmbeddingText.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { generateToolData } from "../services/generateToolData.js";


  export const AiTools = async (req, res) => {
    try {
      // image Cloudinary se
      const imageUrl = req.file ? req.file.path : "";

      // frontend se data
      const {
        name,
        rating,
        pricing,
        category,
        whatItDoes,
        howToUse,
        techRelevance,
        officialLink,
        docLink,
        tutorialLink,
        githubLink,
      } = req.body;

      // slug backend me
      const slug = slugify(name, { lower: true });

      // duplicate check
      const exists = await AiToolsModel.findOne({ name });
      if (exists) {
        return res.json({ success: false, message: "Tool already exists" });
      }

       const embeddingText = buildAiToolEmbeddingText({
      name,
      category: JSON.parse(category),
      whatItDoes,
      howToUse: JSON.parse(howToUse),
      techRelevance: JSON.parse(techRelevance),
      pricing
    });

    console.log(`embeddingText`,  embeddingText.length, "aaa");

    const embedding = await generateEmbedding(embeddingText);

    console.log(`embedding`, embedding);


      const tool = await AiToolsModel.create({
        name,
        slug,
        rating,
        pricing,
        category: JSON.parse(category),
        whatItDoes,
        howToUse: JSON.parse(howToUse),
        techRelevance: JSON.parse(techRelevance),
        image: imageUrl,
        officialLink,
        docLink,
        tutorialLink,
        githubLink,
        embedding, 
        addedBy: "admin",
        isPublished: "approved"
      });
      
      logToolToExcel(tool)

      res.status(201).json({
        success: true,
        message: "Tool added successfully",
        data: tool,
      });


    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getAiToolsData = async(req, res) => {

  try {

    const AiTools = await AiToolsModel
      .find({ isPublished: "approved" })   // ✅ yahi add kiya
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: AiTools.length,
      data: AiTools,
    })

  } catch (error) {
    console.error("Error fetching AI tools:", error);

     res.status(500).json({
      success: false,
      message: "Failed to fetch AI tools",
    });
    
  }
}

export const getAiTool = async (req, res) => {
  try {
    const { toolId } = req.body;
    const userId = req.user.id; // ✅ auth middleware se

    const aiTool = await AiToolsModel.findById(toolId);

    if (!aiTool) {
      return res.status(404).json({
        success: false,
        message: "AI Tool not found",
      });
    }

    // ✅ USER DATA FETCH
    const user = await userModel.findById(userId);

    const isFavorite = user?.favorites?.includes(toolId) || false;
    const isSaved = user?.savedTools?.includes(toolId) || false;

    res.status(200).json({
      success: true,
      data: {
        ...aiTool._doc, // 🔥 original tool data
        isFavorite,
        isSaved,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const addReview = async (req, res) => {
  try {
    const { toolId, rating, comment } = req.body;

    if (!toolId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const tool = await AiToolsModel.findById(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: "Tool not found" });
    }

    const newReview = {
      name: req.user?.name || "Guest User",
      rating,
      comment,
      date: new Date()
    };

    tool.reviews.unshift(newReview);

    // ⭐ optional: average rating auto update
    tool.rating =
      tool.reviews.reduce((a, b) => a + b.rating, 0) /
      tool.reviews.length;

    await tool.save();

    res.json({
      success: true,
      message: "Review added",
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAiLinks = async (req, res) => {
  console.log("API called");

  try {
    let { name, category, officialLink } = req.body;

    const aiData = await generateToolData({ name, category, officialLink });

    return res.json({
      success: true,
      data: {
        name,
        officialLink,
        docLink: aiData.docLink,
        tutorialLink: aiData.tutorialLink,
        githubLink: aiData.githubLink,
        imageUrl: aiData.imageUrl
      }
    });

  } catch (error) {
    console.error("API ERROR 👉", error.message);
    return res.json({
      success: false,
      message: "AI request failed",
      data: {
        name,
        officialLink,
        docLink: "N/A",
        tutorialLink: "N/A",
        githubLink: "N/A",
        imageUrl: "N/A"
      }
    });
  }
};

export default AiTools