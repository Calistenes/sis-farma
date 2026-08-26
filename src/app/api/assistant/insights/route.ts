import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import { requireProUser } from "@/lib/require-pro";
import { buildFinancialSummary } from "@/lib/ai-context";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

const INSIGHTS_PROMPT = `Você é o assistente financeiro do RendaFlow. Analise o resumo financeiro do usuário abaixo e escreva uma análise curta em português do Brasil, em três seções com esses títulos exatos:

Observações
(2-3 frases sobre os padrões mais relevantes: categorias que mais pesam, mudanças entre meses, etc. Baseie-se só nos dados fornecidos.)

Projeção
(1-2 frases estimando saldo/receita/despesa dos próximos 1-2 meses com base na tendência do histórico. Deixe claro que é uma estimativa.)

Alertas
(Se houver risco de saldo negativo ou algo que mereça atenção, diga em 1 frase. Se estiver tudo estável, diga isso brevemente — não invente problema.)

Seja direto, sem enrolação, sem saudação inicial.`;

export async function POST() {
  const auth = await requireProUser();
  if ("error" in auth) return auth.error;

  const financialSummary = await buildFinancialSummary(
    auth.supabase,
    auth.userId
  );

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: `Resumo financeiro:\n${financialSummary}` }],
        },
      ],
      config: {
        systemInstruction: INSIGHTS_PROMPT,
        maxOutputTokens: 1024,
      },
    });

    return NextResponse.json({ insights: response.text ?? "" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return NextResponse.json(
        { error: "Muitas requisições agora, tente de novo em instantes." },
        { status: 429 }
      );
    }
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: "O assistente não conseguiu gerar a análise agora." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Erro inesperado ao gerar a análise." },
      { status: 500 }
    );
  }
}
