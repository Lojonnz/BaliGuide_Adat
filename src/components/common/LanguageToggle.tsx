import { Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export function LanguageToggle() {
  const { lang, toggleLang } = useI18n();

  return (
    <button
      onClick={toggleLang}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        color: 'var(--color-text)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px',
        minWidth: '44px',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      aria-label={`Switch to ${lang === 'en' ? 'Indonesian' : 'English'}`}
    >
      <Globe size={16} />
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
