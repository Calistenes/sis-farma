"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MonthlyPoint = {
  month: string;
  Receitas: number;
  Despesas: number;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-slate-600 dark:bg-slate-800">
      <p className="mb-1 font-medium text-slate-900 dark:text-slate-100">
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-grid)" }}
          tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
          width={40}
          tickFormatter={(value) =>
            value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
          }
        />
        <Tooltip
          cursor={{ fill: "var(--chart-cursor)" }}
          content={<ChartTooltip />}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={32}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--chart-muted)" }}
        />
        <Bar
          dataKey="Receitas"
          fill="var(--chart-income)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="Despesas"
          fill="var(--chart-expense)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
