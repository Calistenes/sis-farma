"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, countTransactionsInRange } from "@/lib/queries";
import { monthlyLimit, monthRange } from "@/lib/plan";

export type TransactionFormState = { error: string | null };

export async function createTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const type = String(formData.get("type") ?? "");
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const occurredOn = String(formData.get("occurred_on") ?? "");
  const categoryId = String(formData.get("category_id") ?? "") || null;

  if (type !== "income" && type !== "expense") {
    return { error: "Selecione o tipo do lançamento." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Informe um valor válido, maior que zero." };
  }
  if (!occurredOn) {
    return { error: "Informe a data do lançamento." };
  }

  const profile = await getProfile(supabase, user.id);
  const limit = monthlyLimit(profile.plan);

  if (limit !== null) {
    const { start, end } = monthRange();
    const used = await countTransactionsInRange(supabase, user.id, start, end);
    if (used >= limit) {
      return {
        error: `Você atingiu o limite de ${limit} lançamentos do plano gratuito neste mês. Faça upgrade para o plano Pro em Configurações.`,
      };
    }
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    description,
    occurred_on: occurredOn,
    category_id: categoryId,
  });

  if (error) {
    return { error: "Não foi possível salvar o lançamento." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { error: null };
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
}
