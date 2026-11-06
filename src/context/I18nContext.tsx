import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lang } from '../types';

interface I18nCtx {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, id: string) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: 'id',
  toggleLang: () => {},
  t: (en) => en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('id');
  const toggleLang = () => setLang((l) => (l === 'en' ? 'id' : 'en'));
  const t = (en: string, id: string) => (lang === 'en' ? en : id);
  return <Ctx.Provider value={{ lang, toggleLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
