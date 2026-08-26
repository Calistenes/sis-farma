import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getProfile,
  getRecentTransactions,
  getTransactionsSince,
} from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { MonthlyChart, type MonthlyPoint } from "@/components/dashboard/MonthlyChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { InsightsCard } from "@/components/dashboard/InsightsCard";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function monthKey(isoDate: string) {
  return isoDate.slice(0, 7);
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [categories, recentTransactions, transactionsInWindow, profile] =
    await Promise.all([
      getCategories(supabase, userId),
      getRecentTransactions(supabase, userId, 8),
      getTransactionsSince(supabase, userId, sixMonthsAgo),
      getProfile(supabase, userId),
    ]);

  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: MONTH_LABEL.format(date),
    });
  }

  const totalsByMonth = new Map<string, { income: number; expense: number }>(
    months.map((m) => [m.key, { income: 0, expense: 0 }])
  );

  for (const transaction of transactionsInWindow) {
    const key = monthKey(transaction.occurred_on);
    const bucket = totalsByMonth.get(key);
    if (!bucket) continue;
    if (transaction.type === "income") bucket.income += transaction.amount;
    else bucket.expense += transaction.amount;
  }

  const chartData: MonthlyPoint[] = months.map((m) => ({
    month: m.label,
    Receitas: totalsByMonth.get(m.key)!.income,
    Despesas: totalsByMonth.get(m.key)!.expense,
  }));

  const currentMonthKey = months[months.length - 1].key;
  const currentMonth = totalsByMonth.get(currentMonthKey)!;
  const balance = currentMonth.income - currentMonth.expense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Visão geral
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Resumo do mês atual e histórico dos últimos 6 meses.
        </p>
      </div>

      <BalanceCards
        balance={balance}
        income={currentMonth.income}
        expense={currentMonth.expense}
      />

      <InsightsCard isPro={profile.plan === "pro"} />

      <Card>
        <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          Receitas x despesas
        </h2>
        <MonthlyChart data={chartData} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Últimos lançamentos
          </h2>
        </div>
        <TransactionsTable
          transactions={recentTransactions}
          categories={categories}
        />
      </Card>
    </div>
  );
}
