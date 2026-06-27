import { useEffect, useState } from "react";

const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      className="rounded-2xl border border-slate-200/70 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)] transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
