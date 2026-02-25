import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { z } from "zod";
import { db } from "@/lib/db";
import { chapters } from "@/db/schema";

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
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;

    // Transform history to Gemini format
    let geminiHistory = (history || []).map((msg) => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // FIX: Ensure history starts with a 'user' role if it's not empty
    if (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
      // If the first message is model, we prepend a dummy user message or remove it.
      // Better strategy: Remove the first message if it's from the model, as Gemini requires user first.
      geminiHistory = geminiHistory.slice(1);
    }

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const systemPrompt = "You are an expert Indonesian Historian. Answer questions for high school students accurately and objectively. Keep your answers concise and educational.";
    
    // Fetch context from database (RAG)
    const allChapters = await db.select({
        title: chapters.title,
        content: chapters.content,
        grade: chapters.grade
    }).from(chapters);

    const contextText = allChapters.map(c => `Title: ${c.title} (Kelas ${c.grade})\nContent: ${c.content}`).join("\n\n");

    const ragInstruction = `
    Use the following context from our museum collection to answer the user's question. 
    If the answer is not in the context, politely say that the information is not yet available in our collection.
    
    Context:
    ${contextText}
    `;

    // Send message with system prompt context if it's the first message or just prepend it
    // To ensure the persona is maintained, we can prepend it to the user message
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
