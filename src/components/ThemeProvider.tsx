"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
export type Accent = "indigo" | "emerald" | "violet" | "rose";

export const ACCENTS: { value: Accent; label: string; hex: string }[] = [
  { value: "indigo", label: "Índigo", hex: "#4f46e5" },
  { value: "emerald", label: "Esmeralda", hex: "#059669" },
  { value: "violet", label: "Violeta", hex: "#7c3aed" },
  { value: "rose", label: "Rosa", hex: "#e11d48" },
];

const THEME_STORAGE_KEY = "rendaflow-theme";
const ACCENT_STORAGE_KEY = "rendaflow-accent";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
  isPro: boolean;
} | null>(null);

// Aplica dark/accent num wrapper local (não em <html>/document), pra não
// vazar a preferência do dashboard pra outras rotas (landing, login) que
// continuam navegando na mesma página via client-side routing.
export function ThemeProvider({
  isPro,
  children,
}: {
  isPro: boolean;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [accent, setAccentState] = useState<Accent>("indigo");

  useEffect(() => {
    if (!isPro) return;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as Accent | null;

    // localStorage só existe no cliente, então isso não pode virar um
    // initializer de useState sem quebrar a hidratação (SSR sempre parte do padrão).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(storedTheme === "dark" ? "dark" : "light");
    setAccentState(
      ACCENTS.some((a) => a.value === storedAccent) ? (storedAccent as Accent) : "indigo"
    );
  }, [isPro]);

  function setTheme(next: Theme) {
    if (!isPro) return;
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  function setAccent(next: Accent) {
    if (!isPro) return;
    setAccentState(next);
    localStorage.setItem(ACCENT_STORAGE_KEY, next);
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, accent, setAccent, isPro }}
    >
      <div className={theme === "dark" ? "dark" : ""} data-accent={accent}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
