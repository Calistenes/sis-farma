import type { Category, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransaction } from "@/app/dashboard/transactions/actions";

export function TransactionsTable({
  transactions,
  categories,
  showActions = false,
}: {
  transactions: Transaction[];
  categories: Category[];
  showActions?: boolean;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Nenhum lançamento ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Descrição</th>
            <th className="py-2 pr-4 font-medium">Categoria</th>
            <th className="py-2 pr-4 text-right font-medium">Valor</th>
            {showActions && <th className="py-2 pl-4" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const category = transaction.category_id
              ? categoryById.get(transaction.category_id)
              : undefined;
            const isIncome = transaction.type === "income";

            return (
              <tr
                key={transaction.id}
                className="border-b border-slate-100 dark:border-slate-700"
              >
                <td className="py-3 pr-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {formatDate(transaction.occurred_on)}
                </td>
                <td className="py-3 pr-4 text-slate-900 dark:text-slate-100">
                  {transaction.description || "—"}
                </td>
                <td className="py-3 pr-4">
                  {category ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${category.color}1a`,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Sem categoria
                    </span>
                  )}
                </td>
                <td
                  className={`py-3 pr-4 text-right font-medium whitespace-nowrap ${
                    isIncome ? "text-[#0ca30c]" : "text-[#d03b3b]"
                  }`}
                >
                  {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                </td>
                {showActions && (
                  <td className="py-3 pl-4 text-right">
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={transaction.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
