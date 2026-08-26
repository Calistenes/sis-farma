"use client";

import { useTheme, ACCENTS } from "@/components/ThemeProvider";

export function AccentPicker() {
  const { accent, setAccent, isPro } = useTheme();

  if (!isPro) {
    return (
      <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Cor de destaque
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Recurso do plano Pro.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
      <p className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
        Cor de destaque
      </p>
      <div className="flex gap-3">
        {ACCENTS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setAccent(option.value)}
            title={option.label}
            aria-label={option.label}
            className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-white transition dark:ring-offset-slate-800 ${
              accent === option.value
                ? "ring-2 ring-slate-900 dark:ring-slate-100"
                : ""
            }`}
            style={{ backgroundColor: option.hex }}
          />
        ))}
      </div>
    </div>
  );
}
