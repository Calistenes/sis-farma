import type { Plan } from "@/lib/types";

export const FREE_PLAN_MONTHLY_LIMIT = 50;

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Gratuito",
  pro: "Pro",
};

export function monthlyLimit(plan: Plan): number | null {
  return plan === "pro" ? null : FREE_PLAN_MONTHLY_LIMIT;
}

export function monthRange(reference: Date = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  return { start, end };
}
