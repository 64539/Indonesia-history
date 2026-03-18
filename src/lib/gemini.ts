import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export async function testGemini() {
  const r = await model.countTokens({ contents: [{ role: "user", parts: [{ text: "ping" }]}] });
  return Boolean(r.totalTokens || r.totalTokens === 0);
}
