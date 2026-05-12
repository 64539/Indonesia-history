import { GoogleGenerativeAI } from "@google/generative-ai";

/** Default for utilities like `testGemini`; `/api/chat` uses a fixed `gemini-2.5-flash` model. */
const DEFAULT_MODEL = "gemini-2.0-flash";

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export function createChatModel(systemInstruction: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI service unavailable - missing API key");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: getGeminiModelName(),
    systemInstruction,
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.3,
    },
  });
}

export async function testGemini() {
  try {
    const model = createChatModel("You are a ping responder. Reply with OK only.");
    const r = await model.countTokens({ contents: [{ role: "user", parts: [{ text: "ping" }] }] });
    return Boolean(r.totalTokens || r.totalTokens === 0);
  } catch (error) {
    console.error("Gemini test failed:", error);
    return false;
  }
}
