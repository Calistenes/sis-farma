import { createClient } from "@/lib/supabase/server";
import { getProfile, countTransactionsInRange } from "@/lib/queries";
import { monthlyLimit, monthRange, PLAN_LABEL } from "@/lib/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
        <h1 className="text-2xl font-semibold text-slate-900">
          Configurações
        </h1>
        <p className="text-sm text-slate-500">Sua conta e plano.</p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Conta</h2>
        <p className="mt-2 text-sm text-slate-600">{user!.email}</p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">
          Plano atual: {PLAN_LABEL[profile.plan]}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {limit === null
            ? "Lançamentos ilimitados."
            : `${used} de ${limit} lançamentos usados neste mês.`}
        </p>

        {profile.plan === "free" && (
          <div className="mt-4 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm text-indigo-900">
              Assine o plano Pro (R$ 29/mês) para lançamentos ilimitados e
              suporte prioritário.
            </p>
            <Button className="mt-3" disabled title="Integração de pagamento em breve">
              Assinar Pro (em breve)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
