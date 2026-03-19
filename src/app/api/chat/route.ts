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

    const body = (await req.json()) as unknown;
    const parsed = ChatRequestSchema.safeParse(body);

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

    const systemPrompt =
      "You are a History Assistant for the Indonesian History Museum. " +
      "Answer in Indonesian for high school students. " +
      "Be accurate, objective, and keep the response concise, clear, and educational. " +
      "If the answer is not in the provided museum collection, say it politely.";
    
    const allChapters = await db.select({
      title: chapters.title,
      content: chapters.content,
      grade: chapters.grade,
    }).from(chapters).where(eq(chapters.status, "Published")).limit(20);

    type ChapterContext = { title: string; content: string; grade: string };
    const contextText = (allChapters as ChapterContext[])
      .map((c) => {
        const ct = c.content ? String(c.content).slice(0, 1000) : "";
        return `Judul: ${c.title} (Kelas ${c.grade})\nKonten: ${ct}`;
      })
      .join("\n\n");

    const ragInstruction = `
      Gunakan konteks koleksi museum berikut untuk menjawab pertanyaan pengguna.
      Jika informasi tidak ada di konteks, katakan dengan sopan bahwa belum tersedia dalam koleksi museum kami.

      Konteks:
      ${contextText}
    `;

    const fullMessage = `${systemPrompt}\n${ragInstruction}\n\nUser Question: ${message}`;

    // Stream response to keep UI responsive.
    const streamResult = await chat.sendMessageStream(fullMessage);
    const encoder = new TextEncoder();
    let lastText = "";

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            const nextText = chunkText ?? "";
            const delta = nextText.startsWith(lastText) ? nextText.slice(lastText.length) : nextText;
            lastText = nextText;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
