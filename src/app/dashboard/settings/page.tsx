import { createClient } from "@/lib/supabase/server";
import { getProfile, countTransactionsInRange } from "@/lib/queries";
import { monthlyLimit, monthRange, PLAN_LABEL } from "@/lib/plan";
import { Card } from "@/components/ui/Card";
import { SubscribeProForm, CancelProForm } from "./ProActions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const [profile, { start, end }] = [await getProfile(supabase, userId), monthRange()];
  const used = await countTransactionsInRange(supabase, userId, start, end);
  const limit = monthlyLimit(profile.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sua conta e plano.
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Conta
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {user!.email}
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Plano atual: {PLAN_LABEL[profile.plan]}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {limit === null
            ? "Lançamentos ilimitados."
            : `${used} de ${limit} lançamentos usados neste mês.`}
        </p>

        {profile.plan === "free" ? <SubscribeProForm /> : <CancelProForm />}
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          Aparência
        </h2>
        <ThemeToggle />
      </Card>
    </div>
  );
}
