export type EntryType = "income" | "expense";
export type Plan = "free" | "pro";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: EntryType;
  color: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  type: EntryType;
  amount: number;
  description: string;
  occurred_on: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  plan: Plan;
  created_at: string;
};
