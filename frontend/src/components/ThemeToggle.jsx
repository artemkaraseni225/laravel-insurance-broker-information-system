import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'insureflow-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [isDark, theme]);

  const label = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
        compact ? 'size-9' : 'h-10 gap-2 px-3 text-sm font-medium'
      }`}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      {!compact && <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>}
    </button>
  );
}

export default ThemeToggle;
