import { pipeline } from "@xenova/transformers";

let extractor;

export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Embedding text is empty or invalid");
    }

    if (!extractor) {
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data); // ✅ 384 dimensions
  } catch (err) {
    console.error("Local embedding error:", err.message);
    throw err;
  }
};
