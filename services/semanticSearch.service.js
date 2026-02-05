export const semanticSearch = async ({
  model,
  embedding,
  limit = 10,
  match = {},
}) => {
  return model.aggregate([
    {
      $vectorSearch: {
        index: "semanticIndex",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit,
      },
    },
    { $match: match },
  ]);
};
