"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function InsightsCard({ isPro }: { isPro: boolean }) {
  const [insights, setInsights] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant/insights", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.debug
            ? `${data.error} (${data.debug})`
            : data.error ?? "Não foi possível gerar a análise."
        );
        return;
      }
      setInsights(data.insights);
    } catch {
      setError("Não foi possível conectar ao assistente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Análise com IA
        </h2>
        {isPro && (
          <Button
            variant="secondary"
            onClick={generate}
            disabled={pending}
            className="text-xs"
          >
            {pending
              ? "Analisando..."
              : insights
                ? "Gerar de novo"
                : "Analisar meus gastos"}
          </Button>
        )}
      </div>

      {!isPro && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Recurso do plano Pro: observações, projeção e alertas sobre seus
          gastos gerados por IA.
        </p>
      )}

      {isPro && !insights && !pending && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Clique em &quot;Analisar meus gastos&quot; pra ver observações e uma
          projeção baseada no seu histórico.
        </p>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {insights && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
          {insights}
        </p>
      )}
    </Card>
  );
}
