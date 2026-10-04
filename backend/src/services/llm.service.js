const { createGroq } = require("@ai-sdk/groq");
const { generateText } = require("ai");
const { groqApiKey, groqModel } = require("../config/env");

const SYSTEM_PROMPT = `You are a friendly, intelligent PDF assistant. You get the user's question and, when available, document information (such as filename and total page count) and relevant passages from their uploaded PDF.

How to reply:
- Question about the PDF (e.g. document contents, facts, "how many pages are in this PDF?", "what is the document title?"): answer accurately using the provided document information and passages. If the answer is not in the document, say you could not find it in the PDF. Never invent facts.
- Casual chat (greetings, thanks, "who are you", small talk): reply briefly and warmly, then gently offer to help with the PDF.
- Format: simple Markdown (short paragraphs, bullets for lists, bold for key terms). No HTML tags. Do not write citations like [Source 1]; the app shows sources separately.

Start your reply with exactly one tag: [DOC] if your answer is based on the PDF information or passages, otherwise [CHAT] (for casual chat, off-topic, or when the answer is not found in the PDF).`;

const TAG_PATTERN = /^\s*\[(DOC|CHAT)\]\s*/i;

// Models sometimes add citation markers like 【SOURCE 2】 or [Source 1]; the UI shows sources itself
const stripCitations = (text) =>
  text.replace(/【[^】]*】/g, "").replace(/\[Source \d+[^\]]*\]/gi, "").replace(/[ \t]+\n/g, "\n").trim();

// Splits "[DOC] answer text" into { answer, usedDocument }.
const parseReply = (text, hasContext) => {
  const tag = text.match(TAG_PATTERN)?.[1];
  return {
    answer: stripCitations(text.replace(TAG_PATTERN, "")),
    usedDocument: tag ? tag.toUpperCase() === "DOC" : hasContext,
  };
};

// Returns { answer, usedDocument }.
const generateAnswer = async (question, context = "") => {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.");
  }

  const hasContext = Boolean(context.trim());
  const groq = createGroq({ apiKey: groqApiKey });
  const result = await generateText({
    model: groq(groqModel),
    system: SYSTEM_PROMPT,
    prompt: `Document context & passages:\n${hasContext ? context : "(none found)"}\n\nUser question: ${question}`,
  });

  const reply = parseReply(result.text ?? "", hasContext);
  if (!reply.answer) throw new Error("The language model returned an empty answer");
  return reply;
};

module.exports = { generateAnswer };