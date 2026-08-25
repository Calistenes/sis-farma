import { createClient } from "@/lib/supabase/server";
import { getCategories, getProfile, getTransactionsInRange } from "@/lib/queries";
import { monthlyLimit, monthRange } from "@/lib/plan";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { NewTransactionForm } from "./NewTransactionForm";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { start, end } = monthRange();

  const [categories, transactions, profile] = await Promise.all([
    getCategories(supabase, userId),
    getTransactionsInRange(supabase, userId, start, end),
    getProfile(supabase, userId),
  ]);

  const limit = monthlyLimit(profile.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Lançamentos</h1>
        <p className="text-sm text-slate-500 capitalize">
          {MONTH_LABEL.format(start)}
          {limit !== null && (
            <span className="ml-2 text-slate-400">
              · {transactions.length}/{limit} lançamentos usados
            </span>
          )}
        </p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Novo lançamento
        </h2>
        <NewTransactionForm categories={categories} />
      </Card>

      <Card>
        <TransactionsTable
          transactions={transactions}
          categories={categories}
          showActions
        />
      </Card>
    </div>
  );
}
