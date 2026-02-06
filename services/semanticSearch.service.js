export const semanticSearch = async ({
  model,
  embedding,
  limit = 10,
  match = {},
}) => {

  console.log("Match filter:", match);
  console.log("Embedding length:", embedding.length);

  return model.aggregate([
    {
      $vectorSearch: {
        index: model.modelName === "Tool" ? "vector_index" : "semanticIndex",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: limit,
        filter: match   // 🔥 IMPORTANT
      },
    }
  ]);
};
