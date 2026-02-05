export const buildAiToolEmbeddingText = (tool) => `
Tool Name: ${tool.name}
Category: ${tool.category?.join(", ")}
What it does: ${tool.whatItDoes}
How to use: ${tool.howToUse?.join(" ")}
Tech relevance: ${tool.techRelevance?.join(" ")}
Pricing: ${tool.pricing}
`;

export const buildResourceEmbeddingText = (res) => {
  console.log("Embedding data:", res);

  return `
Name: ${res.name}
Short description: ${res.short_description}
Detailed description: ${res.detailed_description}
Key concepts: ${res.key_concepts?.join(", ")}

Category: ${res.category?.map(c => c.label).join(", ")}

What it does: ${res.whatItDoes}
How to use: ${res.howToUse?.join(" ")}
Pricing: ${res.pricing}
`;
};



