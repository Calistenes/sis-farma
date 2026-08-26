import type { SupabaseClient } from "@supabase/supabase-js";
import { getCategories, getRecentTransactions, getTransactionsSince } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function monthKey(isoDate: string) {
  return isoDate.slice(0, 7);
}

// Resume compacto das finanças do usuário, em texto, pra alimentar o
// contexto da IA. Evita mandar todo o histórico bruto (custo e ruído).
export async function buildFinancialSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [categories, recentTransactions, transactionsInWindow] =
    await Promise.all([
      getCategories(supabase, userId),
      getRecentTransactions(supabase, userId, 15),
      getTransactionsSince(supabase, userId, sixMonthsAgo),
    ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const months: { key: string; date: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      date,
    });
  }

  const totalsByMonth = new Map<string, { income: number; expense: number }>(
    months.map((m) => [m.key, { income: 0, expense: 0 }])
  );
  const categoryTotalsThisMonth = new Map<string, number>();
  const currentMonthKey = months[months.length - 1].key;

  for (const t of transactionsInWindow) {
    const key = monthKey(t.occurred_on);
    const bucket = totalsByMonth.get(key);
    if (bucket) {
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expense += t.amount;
    }
    if (key === currentMonthKey && t.type === "expense") {
      const catName = t.category_id
        ? categoryById.get(t.category_id)?.name ?? "Sem categoria"
        : "Sem categoria";
      categoryTotalsThisMonth.set(
        catName,
        (categoryTotalsThisMonth.get(catName) ?? 0) + t.amount
      );
    }
  }

  const lines: string[] = [];

  lines.push("Histórico mensal (receitas x despesas, últimos 6 meses):");
  for (const m of months) {
    const totals = totalsByMonth.get(m.key)!;
    lines.push(
      `- ${MONTH_LABEL.format(m.date)}: receitas ${formatCurrency(
        totals.income
      )}, despesas ${formatCurrency(totals.expense)}, saldo ${formatCurrency(
        totals.income - totals.expense
      )}`
    );
  }

  if (categoryTotalsThisMonth.size > 0) {
    lines.push("");
    lines.push("Despesas do mês atual por categoria:");
    const sorted = [...categoryTotalsThisMonth.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    for (const [name, total] of sorted) {
      lines.push(`- ${name}: ${formatCurrency(total)}`);
    }
  }

  if (recentTransactions.length > 0) {
    lines.push("");
    lines.push("Últimos lançamentos:");
    for (const t of recentTransactions) {
      const catName = t.category_id
        ? categoryById.get(t.category_id)?.name ?? "Sem categoria"
        : "Sem categoria";
      const sign = t.type === "income" ? "+" : "-";
      lines.push(
        `- ${formatDate(t.occurred_on)} | ${catName} | ${
          t.description || "(sem descrição)"
        } | ${sign}${formatCurrency(t.amount)}`
      );
    }
  }

  return lines.join("\n");
}
