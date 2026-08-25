"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { PLAN_LABEL } from "@/lib/plan";
import type { Plan } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/transactions", label: "Lançamentos" },
  { href: "/dashboard/categories", label: "Categorias" },
  { href: "/dashboard/settings", label: "Configurações" },
];

export function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          RendaFlow
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-6 py-4">
        <span className="mb-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Plano {PLAN_LABEL[plan]}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="block text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
