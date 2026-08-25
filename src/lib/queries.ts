import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Profile, Transaction } from "@/lib/types";

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return (data as Profile) ?? { id: userId, full_name: null, plan: "free", created_at: "" };
}

export async function getCategories(
  supabase: SupabaseClient,
  userId: string
): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("type")
    .order("name");

  return (data as Category[]) ?? [];
}

export async function getRecentTransactions(
  supabase: SupabaseClient,
  userId: string,
  limit = 8
): Promise<Transaction[]> {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as Transaction[]) ?? [];
}

export async function getTransactionsSince(
  supabase: SupabaseClient,
  userId: string,
  since: Date
): Promise<Transaction[]> {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_on", toISODate(since))
    .order("occurred_on", { ascending: true });

  return (data as Transaction[]) ?? [];
}

export async function getTransactionsInRange(
  supabase: SupabaseClient,
  userId: string,
  start: Date,
  end: Date
): Promise<Transaction[]> {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_on", toISODate(start))
    .lt("occurred_on", toISODate(end))
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  return (data as Transaction[]) ?? [];
}

export async function countTransactionsInRange(
  supabase: SupabaseClient,
  userId: string,
  start: Date,
  end: Date
): Promise<number> {
  const { count } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("occurred_on", toISODate(start))
    .lt("occurred_on", toISODate(end));

  return count ?? 0;
}
