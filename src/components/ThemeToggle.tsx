"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme, isPro } = useTheme();

  if (!isPro) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Tema escuro
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recurso do plano Pro.
          </p>
        </div>
        <Button variant="secondary" disabled>
          Bloqueado
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Tema escuro
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Alterne entre claro e escuro no painel.
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
      </Button>
    </div>
  );
}
