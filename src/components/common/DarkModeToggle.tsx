import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export function DarkModeToggle() {
  const { t } = useI18n();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('baliguide_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('baliguide_theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('baliguide_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      aria-label={isDark ? t('Switch to light mode', 'Beralih ke mode terang') : t('Switch to dark mode', 'Beralih ke mode gelap')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      title={isDark ? t('Switch to light mode', 'Beralih ke mode terang') : t('Switch to dark mode', 'Beralih ke mode gelap')}
    >
      {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
    </button>
  );
}
