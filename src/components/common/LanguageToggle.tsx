import { Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';


export function LanguageToggle() {
  const { lang, toggleLang } = useI18n();

  const targetLabel = lang === 'en' ? 'Indonesian' : 'English';
  const targetCode = lang === 'en' ? 'ID' : 'EN';

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="language-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        color: 'var(--color-text)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'border-color 150ms ease, color 150ms ease, box-shadow 150ms ease',
        minHeight: '44px',
        minWidth: '44px',
        boxShadow: 'var(--shadow)',
      }}
      aria-label={`Switch to ${targetLabel}`}
      aria-pressed={lang === 'en'}
    >
      <Globe size={16} aria-hidden="true" />
      <span aria-hidden="true">{lang.toUpperCase()}</span>
      <span className="sr-only">({targetCode})</span>
    </button>
  );
}
