import RsourcesModel from "../models/RsourcesModel.js";
import userModel from "../models/userModel.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { buildResourceEmbeddingText } from "../utils/buildEmbeddingText.js";

// helper: slug generator
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const ResourcesData = async (req, res) => {
  try {
    const {
      img,
      color,
      name,
      rating,
      pricing,
      icon,
      short_description,
      detailed_description,
      key_concepts,
      category,
      whatItDoes,
      howToUse,
      learningRoadmapData,
      detailedStepByStepLearning,
      resources,
    } = req.body;

    if (!name || !short_description || !category?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // slug backend me generate hoga
    const slug = generateSlug(name);

    // slug already exists check
    const existing = await RsourcesModel.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Resource already exists" });
    }

    const embeddingText = buildResourceEmbeddingText({
      name,
      short_description,
      detailed_description,
      key_concepts: Array.isArray(key_concepts)
        ? key_concepts
        : JSON.parse(key_concepts),

      category: Array.isArray(category) ? category : JSON.parse(category),
    });

    console.log(`embeddingText`, embeddingText.length, "aaa");

    const embedding = await generateEmbedding(embeddingText);

    console.log(`embedding`, embedding);

    const newResource = await RsourcesModel.create({
      img,
      color,
      icon,
      name,
      slug,
      rating,
      pricing,
      short_description,
      detailed_description,
      key_concepts,
      category,
      embedding,
      whatItDoes,
      howToUse,
      learningRoadmapData,
      detailedStepByStepLearning,
      resources,
    });
    console.log(`data coming`);

    res.status(201).json({
      success: true,
      data: newResource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getResourcesData = async (req, res) => {
  try {
    // ya req.params

    const resourceTool = await RsourcesModel.find();

    if (!resourceTool) {
      return res.status(404).json({
        success: false,
        message: "Resources not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resourceTool,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getResourcesToolBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // URL se slug
    const userId = req.user.id;

    const tool = await RsourcesModel.findOne({ slug });

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    const user = await userModel.findById(userId);

    const isBookmarked = user?.bookmarks?.includes(tool._id) || false;
    const bookmarkCount = tool.bookmarksCount || 0;

    res.status(200).json({
      success: true,
      data: tool,
      isBookmarked,
      bookmarkCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookmarkedResources = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ids",
      });
    }

    const resources = await RsourcesModel.find({
      _id: { $in: ids },
      isPublished: true, // agar approval system hai
    });

    res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error("RESOURCE BOOKMARK ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const addResouceReview = async (req, res) => {
  try {
    const { resourceId, rating, comment } = req.body;

    if (!resourceId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const tool = await RsourcesModel.findById(resourceId);
    if (!tool) {
      return res.status(404).json({ success: false, message: "Resource not found" });
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

export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: "Resource ID required",
      });
    }

    // 🔹 user + resource fetch
    const user = await userModel.findById(userId);
    const resource = await RsourcesModel.findById(resourceId);

    if (!user || !resource) {
      return res.status(404).json({
        success: false,
        message: "User or Resource not found",
      });
    }

    // 🔹 check bookmark already exists?
    const isBookmarked = user.bookmarks.includes(resourceId);

    if (isBookmarked) {
      // ❌ REMOVE bookmark → -1
      user.bookmarks.pull(resourceId);
      resource.bookmarksCount = Math.max(
        0,
        resource.bookmarksCount - 1
      );
    } else {
      // ✅ ADD bookmark → +1
      user.bookmarks.push(resourceId);
      resource.bookmarksCount += 1;
    }

    await user.save();
    await resource.save();

    return res.json({
      success: true,
      bookmarked: !isBookmarked, // 👈 frontend ke liye
      bookmarkCount: resource.bookmarksCount,
    });
  } catch (error) {
    console.error("BOOKMARK TOGGLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export default ResourcesData;
