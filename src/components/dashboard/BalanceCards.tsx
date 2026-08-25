import { Card } from "@/components/ui/Card";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BalanceCards({
  balance,
  income,
  expense,
}: {
  balance: number;
  income: number;
  expense: number;
}) {
  const items = [
    { label: "Saldo do mês", value: balance, tone: "text-slate-900" },
    { label: "Receitas do mês", value: income, tone: "text-[#0ca30c]" },
    { label: "Despesas do mês", value: expense, tone: "text-[#d03b3b]" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>
            {formatCurrency(item.value)}
          </p>
        </Card>
      ))}
    </div>
  );
}
