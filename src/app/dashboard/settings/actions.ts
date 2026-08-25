"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPreapproval, cancelPreapproval } from "@/lib/mercadopago";

export type ProActionState = { error: string | null };

async function siteOrigin() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function startProCheckout(): Promise<ProActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  let initPoint: string;
  try {
    const preapproval = await createPreapproval({
      userId: user.id,
      email: user.email,
      backUrl: `${await siteOrigin()}/dashboard/settings`,
    });

    if (!preapproval.init_point) {
      return { error: "Mercado Pago não retornou o link de pagamento." };
    }
    initPoint = preapproval.init_point;

    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ mp_preapproval_id: preapproval.id })
      .eq("id", user.id);
  } catch {
    return { error: "Não foi possível iniciar a assinatura. Tente novamente." };
  }

  redirect(initPoint);
}

export async function cancelProSubscription(): Promise<ProActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("mp_preapproval_id")
    .eq("id", user.id)
    .single();

  if (!profile?.mp_preapproval_id) {
    return { error: "Nenhuma assinatura ativa encontrada." };
  }

  try {
    await cancelPreapproval(profile.mp_preapproval_id);

    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ plan: "free", plan_updated_at: new Date().toISOString() })
      .eq("id", user.id);
  } catch {
    return { error: "Não foi possível cancelar a assinatura. Tente novamente." };
  }

  revalidatePath("/dashboard/settings");
  return { error: null };
}
