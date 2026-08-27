import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import { requireProUser } from "@/lib/require-pro";
import { buildFinancialSummary } from "@/lib/ai-context";
import { getGeminiClient, GEMINI_MODEL, ASSISTANT_SYSTEM_PROMPT } from "@/lib/gemini";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isValidHistory(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_MESSAGES &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= MAX_MESSAGE_LENGTH
    )
  );
}

export async function POST(request: Request) {
  const auth = await requireProUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!isValidHistory(body?.messages)) {
    return NextResponse.json(
      { error: "Mensagens inválidas." },
      { status: 400 }
    );
  }
  const messages: ChatMessage[] = body.messages;

  const financialSummary = await buildFinancialSummary(
    auth.supabase,
    auth.userId
  );

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `${ASSISTANT_SYSTEM_PROMPT}\n\nResumo financeiro do usuário:\n${financialSummary}`,
        maxOutputTokens: 1024,
      },
    });

    return NextResponse.json({ reply: response.text ?? "" });
  } catch (err) {
    console.error("[assistant/chat] Gemini error:", err);
    if (err instanceof ApiError && err.status === 429) {
      return NextResponse.json(
        { error: "Muitas requisições agora, tente de novo em instantes." },
        { status: 429 }
      );
    }
    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          error: "O assistente não conseguiu responder agora.",
          debug: `status=${err.status} message=${err.message}`,
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      {
        error: "Erro inesperado ao consultar o assistente.",
        debug: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
