import { generateEmbedding } from "../services/embedding.service.js";
import { semanticSearch } from "../services/semanticSearch.service.js";
import AiTool from "../models/AiToolsModel.js";
import Resource from "../models/RsourcesModel.js";

export const globalSearch = async (req, res) => {


  console.log("Global search called");
  const { query } = req.query;
  if (!query) return res.json({ tools: [], resources: [] });

  const queryEmbedding = await generateEmbedding(query);

  const tools = await semanticSearch({
    model: AiTool,
    embedding: queryEmbedding,
    match: { isPublished: "approved" },
  });

  console.log("Search text:", query);
console.log("Search embedding length:", queryEmbedding.length);


  const resources = await semanticSearch({
    model: Resource,
    embedding: queryEmbedding,
    match: { isPublished: true },
  });

  res.json({ tools, resources });
};
