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

const INCOME_COLOR = "#2a78d6";
const EXPENSE_COLOR = "#e34948";
const GRID_COLOR = "#e1e0d9";
const MUTED_TEXT = "#898781";

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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-slate-600">
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
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={{ stroke: GRID_COLOR }}
          tick={{ fill: MUTED_TEXT, fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: MUTED_TEXT, fontSize: 12 }}
          width={40}
          tickFormatter={(value) =>
            value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
          }
        />
        <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          align="right"
          height={32}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: MUTED_TEXT }}
        />
        <Bar
          dataKey="Receitas"
          fill={INCOME_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="Despesas"
          fill={EXPENSE_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
