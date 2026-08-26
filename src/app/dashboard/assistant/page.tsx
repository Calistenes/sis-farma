import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AssistantChat } from "@/components/dashboard/AssistantChat";

export default async function AssistantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile(supabase, user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Assistente IA
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pergunte sobre suas finanças com base nos seus lançamentos.
        </p>
      </div>

      {profile.plan === "pro" ? (
        <Card>
          <AssistantChat />
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            O assistente de IA é um recurso do plano Pro. Assine para
            conversar sobre seus gastos, receitas e tendências.
          </p>
          <Link href="/dashboard/settings" className="mt-4 block w-fit">
            <Button>Assinar Pro</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
