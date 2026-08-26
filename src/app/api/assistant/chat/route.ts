import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser } from "@/lib/require-pro";
import { buildFinancialSummary } from "@/lib/ai-context";
import { getAnthropicClient, AI_MODEL, ASSISTANT_SYSTEM_PROMPT } from "@/lib/anthropic";

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
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: `${ASSISTANT_SYSTEM_PROMPT}\n\nResumo financeiro do usuário:\n${financialSummary}`,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Muitas requisições agora, tente de novo em instantes." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "O assistente não conseguiu responder agora." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Erro inesperado ao consultar o assistente." },
      { status: 500 }
    );
  }
}
