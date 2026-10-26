const { groqApiKey, groqModel, geminiApiKey, visionModel } = require("../config/env");

let aiSdkPromise = null;
const getAiSdk = async () => {
  if (!aiSdkPromise) {
    aiSdkPromise = Promise.all([
      import("@ai-sdk/groq"),
      import("ai"),
    ]).then(([groqMod, aiMod]) => ({
      createGroq: groqMod.createGroq,
      generateText: aiMod.generateText,
    }));
  }
  return aiSdkPromise;
};

const SYSTEM_PROMPT =
  "You answer questions using ONLY the supplied PDF context. " +
  "If the answer is not in the context, say you could not find it in the uploaded PDF. " +
  "Do not invent facts. Be concise and clear. " +
  "Format the answer in simple Markdown: short paragraphs, bullet lists for multiple points, " +
  "and bold for key terms. Use a table only when comparing several items. " +
  "Never use HTML tags (like <br>). Do not write source citations such as [Source 1]; " +
  "the app shows the sources separately.";

// Models sometimes add citation markers like 【SOURCE 2】 or [Source 1]; the UI shows sources itself
const stripCitations = (text) =>
  text.replace(/【[^】]*】/g, "").replace(/\[Source \d+[^\]]*\]/gi, "").replace(/[ \t]+\n/g, "\n").trim();

const GROQ_CANDIDATES = [
  groqModel,
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
].filter((m, i, arr) => m && arr.indexOf(m) === i);

async function generateAnswerGemini(question, context) {
  if (!geminiApiKey) throw new Error("No language model provider available. Please set GROQ_API_KEY or GEMINI_API_KEY.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(visionModel || "gemini-2.5-flash")}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{
          role: "user",
          parts: [{ text: `Context:\n${context}\n\nQuestion: ${question}` }],
        }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Gemini LLM error (${response.status}): ${data.error?.message || "Generation failed"}`);
  }
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const answer = stripCitations(rawText);
  if (!answer) throw new Error("Gemini returned an empty answer");
  return answer;
}

const generateAnswer = async (question, context) => {
  let lastError = null;

  if (groqApiKey) {
    try {
      const { createGroq, generateText } = await getAiSdk();
      const groq = createGroq({ apiKey: groqApiKey });

      for (const modelName of GROQ_CANDIDATES) {
        try {
          const result = await generateText({
            model: groq(modelName),
            system: SYSTEM_PROMPT,
            prompt: `Context:\n${context}\n\nQuestion: ${question}`,
          });

          const answer = stripCitations(result.text ?? "");
          if (answer) return answer;
        } catch (err) {
          lastError = err;
          const msg = String(err?.message || "");
          console.warn(`[LLM] Groq model "${modelName}" failed: ${msg}. Attempting fallback...`);
        }
      }
    } catch (sdkErr) {
      lastError = sdkErr;
      console.warn(`[LLM] Groq SDK initialization error: ${sdkErr.message}`);
    }
  }

  // Fallback to Gemini if Groq is unavailable or all candidate models failed
  if (geminiApiKey) {
    try {
      return await generateAnswerGemini(question, context);
    } catch (geminiErr) {
      lastError = geminiErr;
    }
  }

  throw lastError || new Error("GROQ_API_KEY is missing. Add it to .env.");
};

module.exports = { generateAnswer };