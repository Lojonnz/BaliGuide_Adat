import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Lang } from '../types';

type TFn = (en: string, id: string) => string;

interface I18nCtx {
  lang: Lang;
  /** Same as `lang === 'en'` — useful in classNames / aria */
  isEnglish: boolean;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: TFn;
}

const Ctx = createContext<I18nCtx>({
  lang: 'id',
  isEnglish: false,
  toggleLang: () => {},
  setLang: () => {},
  t: (en) => en,
});

const STORAGE_KEY = 'bga-lang';

function detectInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') return saved;
    // Browser language hint — default to Indonesian for BaliGuide (local audience)
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'id';
    if (nav && nav.toLowerCase().startsWith('en')) return 'en';
  } catch {
    /* ignore */
  }
  return 'id';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // One-time initial value only
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'en' ? 'id' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const t = useCallback<TFn>(
    (en, id) => (lang === 'en' ? en : id),
    [lang]
  );

  // Sync <html lang> for screen readers / hyphenation
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'en' ? 'en' : 'id';
    }
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, isEnglish: lang === 'en', toggleLang, setLang, t }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
