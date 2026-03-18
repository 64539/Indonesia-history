import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const reqBuckets = new Map<string, { c: number; t: number }>();

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "bot"]),
      content: z.string(),
    })
  ).optional(),
});

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const { model } = await import("@/lib/gemini");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const prev = reqBuckets.get(ip);
    if (!prev || now - prev.t > RATE_LIMIT_WINDOW_MS) {
      reqBuckets.set(ip, { c: 1, t: now });
    } else if (prev.c >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    } else {
      reqBuckets.set(ip, { c: prev.c + 1, t: now });
    }

    const body = await req.text();
    const parsed = ChatRequestSchema.safeParse(JSON.parse(body));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    let { message, history } = parsed.data;
    if (message.length > 2000) {
      message = message.slice(0, 2000);
    }

    let geminiHistory = (history || []).map((msg) => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    if (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
      geminiHistory = geminiHistory.slice(1);
    }

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const systemPrompt = "You are an expert Indonesian Historian. Answer questions for high school students accurately and objectively. Keep your answers concise and educational.";
    
    const allChapters = await db.select({
        title: chapters.title,
        content: chapters.content,
        grade: chapters.grade
    }).from(chapters).where(eq(chapters.status, "Published")).limit(20);

    const contextText = allChapters.map(c => {
      const ct = (c as any).content ? String((c as any).content).slice(0, 1000) : "";
      return `Title: ${c.title} (Kelas ${c.grade})\nContent: ${ct}`;
    }).join("\n\n");

    const ragInstruction = `
    Use the following context from our museum collection to answer the user's question. 
    If the answer is not in the context, politely say that the information is not yet available in our collection.
    
    Context:
    ${contextText}
    `;

    const fullMessage = `${systemPrompt}\n${ragInstruction}\n\nUser Question: ${message}`;

    const result = await chat.sendMessage(fullMessage);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
