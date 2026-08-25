"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = { error: string | null };

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const color = String(formData.get("color") ?? "#6366f1");

  if (!name) return { error: "Informe um nome para a categoria." };
  if (type !== "income" && type !== "expense") {
    return { error: "Selecione o tipo da categoria." };
  }

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    color,
  });

  if (error) return { error: "Não foi possível criar a categoria." };

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/transactions");
  return { error: null };
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/transactions");
}
