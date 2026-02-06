import { generateEmbedding } from "../services/embedding.service.js";
import { semanticSearch } from "../services/semanticSearch.service.js";
import Tool from "../models/AiToolsModel.js";
import Resource from "../models/RsourcesModel.js";

export const globalSearch = async (req, res) => {

  console.log("Global search called");

  const { query } = req.query;
  if (!query) return res.json({ tools: [], resources: [] });

  const queryEmbedding = await generateEmbedding(query);

  // 🧪 STEP 1: check DB connection + tool data
  const allTools = await Tool.find();
  console.log("ALL TOOLS FROM DB:", allTools.length);
  // console.log(allTools);

  // 🧪 STEP 2: check approved tools
  const approvedTools = await Tool.find({ isPublished: "approved" });
  console.log("APPROVED TOOLS:", approvedTools.length);
  // console.log(approvedTools);

  // 🧪 STEP 3: check embedding exist
  const embeddingTools = await Tool.find({
    embedding: { $exists: true, $ne: [] }
  });
  console.log("TOOLS WITH EMBEDDING:", embeddingTools.length);

  // 🧪 semantic search
  const tools = await semanticSearch({
    model: Tool,
    embedding: queryEmbedding,
    
  });

  console.log("SEMANTIC SEARCH TOOLS:", tools.length);

  const resources = await semanticSearch({
    model: Resource,
    embedding: queryEmbedding,
  });

  res.json({ tools, resources });
};
