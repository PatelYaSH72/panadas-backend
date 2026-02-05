// backend/services/llm.service.js
import fetch from "node-fetch";

export async function callLLM(prompt) {
  const apiKey = process.env.GEMINI_API_KEY; // tumhari Google Gemini API key

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        maxOutputTokens: 500,
      }),
    }
  );

  const data = await res.json();

  if (!data.candidates || !data.candidates[0]) {
    return { status: "review", reason: "No AI response" };
  }

  try {
    const aiJson = JSON.parse(data.candidates[0].content.text);
    return aiJson;
  } catch (err) {
    return { status: "review", reason: "Invalid AI JSON response" };
  }
}
