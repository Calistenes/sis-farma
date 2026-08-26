import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { NewCategoryForm } from "./NewCategoryForm";
import { deleteCategory } from "./actions";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const categories = await getCategories(supabase, userId);
  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Categorias
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organize suas receitas e despesas por categoria.
        </p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          Nova categoria
        </h2>
        <NewCategoryForm />
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Receitas
          </h2>
          <CategoryList categories={income} />
        </Card>
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Despesas
          </h2>
          <CategoryList categories={expense} />
        </Card>
      </div>
    </div>
  );
}

function CategoryList({
  categories,
}: {
  categories: { id: string; name: string; color: string }[];
}) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhuma categoria ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-700"
        >
          <span className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="text-xs font-medium text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
            >
              Excluir
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
