const { groqApiKey, groqModel } = require("../config/env");

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

const generateAnswer = async (question, context) => {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.");
  }

  const { createGroq, generateText } = await getAiSdk();
  const groq = createGroq({ apiKey: groqApiKey });
  const result = await generateText({
    model: groq(groqModel),
    system: SYSTEM_PROMPT,
    prompt: `Context:\n${context}\n\nQuestion: ${question}`,
  });

  const answer = stripCitations(result.text ?? "");
  if (!answer) throw new Error("The language model returned an empty answer");
  return answer;
};

module.exports = { generateAnswer };