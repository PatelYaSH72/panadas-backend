import { callLLM } from "./llm.service.js";

export async function aiModerate(data) {
  const prompt = `
You are an AI moderator for an AI tools directory.

Check the following submission and respond ONLY in JSON.

Rules:
- Reject if spam, abuse, fake tool, nonsense
- Reject if description doesn't match a real AI tool
- Approve only if professional & legit

Data:
Name: ${data.name}
Description: ${data.whatItDoes}
Website: ${data.officialLink}

Respond format:
{
  "status": "approved | rejected | review",
  "reason": "short explanation"
}
`;

const aiResult = await callLLM(prompt);


  return aiResult;
}


