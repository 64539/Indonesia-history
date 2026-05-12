import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { truncateAtParagraphBoundary } from "@/lib/context-budget";
import { extractTheoryForContext, summarizeArtifactsForContext } from "@/lib/chapter-content";
import { retrieveChaptersForChat, type RetrievedChapterRow } from "@/lib/chat-retrieval";

export const dynamic = "force-dynamic";

const RAG_MODEL = "gemini-2.5-flash" as const;
const CONTEXT_PLACEHOLDER = "{{INJECT_DATABASE_STRING_DI_SINI}}";

const SYSTEM_INSTRUCTION_TEMPLATE = `Anda adalah Asisten RuangWaktu 12, asisten AI edukatif yang ahli dalam bidang Sejarah Indonesia, dirancang khusus untuk siswa SMA.
TUGAS UTAMA: Menjawab pertanyaan pengguna HANYA berdasarkan informasi yang terdapat dalam blok <KONTEKS_MATERI> yang diberikan.
ATURAN KETAT:
1. OUT OF CONTEXT: Jika pengguna menanyakan sesuatu yang tidak ada di <KONTEKS_MATERI>, WAJIB jawab: 'Maaf, materi mengenai hal tersebut saat ini belum tersedia dalam koleksi RuangWaktu 12.' DILARANG halusinasi.
2. PEMAHAMAN NLP: Pahami bahasa santai/singkatan anak SMA, cocokkan niatnya dengan konteks.
3. FORMAT: Gunakan bahasa asik, tidak kaku, dan gunakan Markdown. JANGAN menyertakan blok JSON mentah ke pengguna.

<KONTEKS_MATERI>
${CONTEXT_PLACEHOLDER}
</KONTEKS_MATERI>`;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const reqBuckets = new Map<string, { c: number; t: number }>();

function sanitizeInput(raw: string): string {
  return raw
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/ignore\s+(previous|all|prior)\s+instructions?/gi, "[BLOCKED]")
    .replace(/system\s*:/gi, "[SYS]")
    .replace(/\bprompt\b/gi, "[P]")
    .trim()
    .slice(0, 2000);
}

const ChatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "bot"]),
          content: z.string().max(4000),
        })
      )
      .max(100)
      .optional(),
    message: z.string().max(3000).optional(),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "bot"]),
          content: z.string().max(4000),
        })
      )
      .max(50)
      .optional(),
  })
  .refine(
    (d) =>
      (Array.isArray(d.messages) && d.messages.length > 0) ||
      (typeof d.message === "string" && d.message.trim().length > 0),
    { message: "Kirim 'messages' tidak kosong atau 'message' tidak kosong." }
  );

function buildInjectedContext(rows: RetrievedChapterRow[], maxTotalChars: number): string {
  const parts = rows.map((c) => {
    const theory = extractTheoryForContext(c.content);
    const artifactsSummary = summarizeArtifactsForContext(c.content);
    const blocks = [
      `Judul: ${c.title} (${c.grade})`,
      theory ? `Teori:\n${theory}` : "",
      artifactsSummary ? `Artefak:\n${artifactsSummary}` : "",
    ].filter(Boolean);
    return blocks.join("\n\n");
  });
  const joined = parts.join("\n\n---\n\n");
  return truncateAtParagraphBoundary(joined, maxTotalChars);
}

function isGeminiQuotaError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const s = (error as { status?: number }).status;
    if (s === 429) return true;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("429") || msg.includes("Too Many Requests");
}

function resolveChatPayload(data: z.infer<typeof ChatRequestSchema>): {
  latestUserSanitized: string;
  geminiHistory: { role: "user" | "model"; parts: { text: string }[] }[];
} {
  if (data.messages && data.messages.length > 0) {
    let lastUserIdx = -1;
    for (let i = data.messages.length - 1; i >= 0; i--) {
      if (data.messages[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) {
      return { latestUserSanitized: "", geminiHistory: [] };
    }
    const prior = data.messages.slice(0, lastUserIdx);
    let geminiHistory = prior.map((msg) => ({
      role: (msg.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: sanitizeInput(msg.content) }],
    }));
    if (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
      geminiHistory = geminiHistory.slice(1);
    }
    const latestUserSanitized = sanitizeInput(data.messages[lastUserIdx].content);
    return { latestUserSanitized, geminiHistory };
  }

  const latestUserSanitized = sanitizeInput(data.message ?? "");
  let geminiHistory = (data.history ?? []).map((msg) => ({
    role: (msg.role === "bot" ? "model" : "user") as "user" | "model",
    parts: [{ text: sanitizeInput(msg.content) }],
  }));
  if (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
    geminiHistory = geminiHistory.slice(1);
  }
  return { latestUserSanitized, geminiHistory };
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const prev = reqBuckets.get(ip);
    if (!prev || now - prev.t > RATE_LIMIT_WINDOW_MS) {
      reqBuckets.set(ip, { c: 1, t: now });
    } else if (prev.c >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    } else {
      reqBuckets.set(ip, { c: prev.c + 1, t: prev.t });
    }

    const body = (await req.json()) as unknown;
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    if (parsed.data.messages && parsed.data.messages.length > 0) {
      const hasUser = parsed.data.messages.some((m) => m.role === "user");
      if (!hasUser) {
        return NextResponse.json(
          { error: "Array 'messages' harus berisi minimal satu pesan dengan role 'user'." },
          { status: 400 }
        );
      }
    }

    const { latestUserSanitized, geminiHistory } = resolveChatPayload(parsed.data);

    if (!latestUserSanitized || latestUserSanitized === "[BLOCKED]") {
      return NextResponse.json(
        { error: "Pesan tidak valid atau mengandung konten tidak diizinkan." },
        { status: 400 }
      );
    }

    const retrieved = await retrieveChaptersForChat(latestUserSanitized);
    const injectedContext = buildInjectedContext(retrieved, 14_000);
    const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace(
      CONTEXT_PLACEHOLDER,
      injectedContext
    );

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: RAG_MODEL,
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.3,
      },
    });

    const chat = model.startChat({
      history: geminiHistory,
    });

    const streamResult = await chat.sendMessageStream(latestUserSanitized);
    const encoder = new TextEncoder();
    let lastText = "";

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            const nextText = chunkText ?? "";
            const delta = nextText.startsWith(lastText)
              ? nextText.slice(lastText.length)
              : nextText;
            lastText = nextText;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (isGeminiQuotaError(error)) {
      return NextResponse.json(
        { error: "Layanan AI sedang sibuk (kuota). Coba lagi sebentar lagi." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Gagal memproses permintaan. Coba lagi." },
      { status: 500 }
    );
  }
}
