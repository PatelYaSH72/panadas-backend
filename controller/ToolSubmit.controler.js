import { ToolSchema } from "../validators/tool.schema.js";
import { checkLink } from "../services/linkChecker.service.js";
import { containsAbuse } from "../services/profanity.service.js";
import { aiModerate } from "../services/aiModeration.service.js";
import AiToolsModel from "../models/AiToolsModel.js";
import { buildAiToolEmbeddingText, buildResourceEmbeddingText } from "../utils/buildEmbeddingText.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { generateToolData } from "../services/generateToolData.js";


export const submitTool = async (req, res) => {
  try {
    console.log("Submit Tool Called");

    // STEP 1: Validate input using Zod
    const parsed = ToolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: parsed.error.format(),
      });
    }
    const data = parsed.data;

    console.log("Received Data 👉", data.officialLink);

    // STEP 2: Link Validation (Official & Doc links)
    // if (!data.officialLink || !(await checkLink(data.officialLink))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Official website link is not reachable",
    //   });
    // }

    // if (data.docLink && !(await checkLink(data.docLink))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Documentation link is not reachable",
    //   });
    // }

    // if (data.tutorialLink && !(await checkLink(data.tutorialLink))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Tutorial link is not reachable",
    //   });
    // }

    // if (data.githubLink && !(await checkLink(data.githubLink))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Github link is not reachable",
    //   });
    // }

    // STEP 3: Profanity / Abuse Filter
    if (containsAbuse(data.name) || containsAbuse(data.whatItDoes)) {
      return res.status(400).json({
        success: false,
        message: "Inappropriate language detected",
      });
    }

        // STEP 3.5: Check duplicate tool by name (case-insensitive)
    const existingTool = await AiToolsModel.findOne({
      name: { $regex: `^${data.name}$`, $options: "i" }
    });

    if (existingTool) {
      return res.status(409).json({
        success: false,
        message: "Tool with same name already exists",
      });
    }


    // STEP 4: AI Moderation
    const aiResult = await aiModerate(data);
    if (!aiResult) {
      return res.status(500).json({
        success: false,
        message: "AI moderation failed",
      });
    }
    if (aiResult.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: aiResult.reason,
      });
    }

    const {
      name,
      category,
      whatItDoes,
      howToUse,
      techRelevance,
      pricing
    } = data;

    const embeddingText = buildAiToolEmbeddingText({
      name,
      category: typeof category === "string" ? JSON.parse(category) : category,
      whatItDoes,
      howToUse: typeof howToUse === "string" ? JSON.parse(howToUse) : howToUse,
      techRelevance:
        typeof techRelevance === "string"
          ? JSON.parse(techRelevance)
          : techRelevance,
      pricing,
    });

    console.log("embeddingText length 👉", embeddingText.length);

    const embedding = await generateEmbedding(embeddingText);

    console.log("embedding generated ✅", embedding?.length);

    // STEP 5: Save to Database
    const savedTool = await AiToolsModel.create({
      ...data,
      embedding,
      isPublished: aiResult.status === "approved" ? "approved" : "pending",
      moderationReason: aiResult.reason || "",
      addedBy: req.user ? "user" : "guest",
      userId: req.user?._id || null,
    });

    console.log("SAVED TOOL 👉", savedTool);

    // STEP 6: Return success response
    return res.json({
      success: true,
      message: "Tool submitted successfully",
      moderationStatus: aiResult.status,
      toolId: savedTool._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tool with same name already exists",
      });
    }

    console.error("Server Error 👉", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

