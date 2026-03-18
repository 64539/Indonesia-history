import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY is not defined");
  throw new Error("AI service unavailable - missing API key");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function testGemini() {
  try {
    const r = await model.countTokens({ contents: [{ role: "user", parts: [{ text: "ping" }]}] });
    return Boolean(r.totalTokens || r.totalTokens === 0);
  } catch (error) {
    console.error("Gemini test failed:", error);
    return false;
  }
}
