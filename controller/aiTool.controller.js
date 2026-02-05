import { generateEmbedding } from "../services/embedding.service.js";
import { buildAiToolEmbeddingText } from "../utils/buildEmbeddingText.js";

export const createAiTool = async (req, res) => {
  const tool = new AiTool(req.body);

  const text = buildAiToolEmbeddingText(tool);
  tool.embedding = await generateEmbedding(text);

  await tool.save();
  res.json(tool);
};
