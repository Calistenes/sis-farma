"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Quanto gastei esse mês?",
  "Qual categoria mais pesa no meu orçamento?",
  "Como está minha tendência de saldo nos últimos meses?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    setError(null);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text.trim() },
    ];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não foi possível responder agora.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Não foi possível conectar ao assistente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pergunte sobre seus gastos, receitas ou tendências. Exemplos:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-accent text-white"
                  : "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              Pensando...
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre suas finanças..."
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
