import fetch from "node-fetch";

export async function generateToolData({ name, category, officialLink }) {
  try {
    console.log("FreeFlow LLM function started");

    const prompt = `
Tool Name: ${name}
Category: ${category}
Official Website: ${officialLink}

Return ONLY valid JSON:
{
  "docLink": "",
  "tutorialLink": "",
  "githubLink": "",
  "imageUrl": ""
}

Rules:
- If not confident, use "N/A"
- No text outside JSON
`;

    const res = await fetch("https://freeflow-llm.joshsparks.dev/api/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen-7b-chat",   // free model
        input: prompt
      }),
    });

    const data = await res.json();

    // FreeFlow LLM always returns 'output_text'
    const text = data.output_text || "";

    console.log("FreeFlow raw text:", text);

    // Extract JSON safely
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    return json
      ? JSON.parse(json)
      : {
          docLink: "N/A",
          tutorialLink: "N/A",
          githubLink: "N/A",
          imageUrl: "N/A"
        };

  } catch (error) {
    console.error("FreeFlow ERROR 👉", error.message);
    return {
      docLink: "N/A",
      tutorialLink: "N/A",
      githubLink: "N/A",
      imageUrl: "N/A"
    };
  }
}
