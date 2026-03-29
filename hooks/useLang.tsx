'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { type Lang, detectLang, T, LANGUAGES } from '@/lib/i18n/translations';

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en', setLang: () => {}
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('tb_lang')) as Lang | null;
    setLangState(saved || detectLang());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem('tb_lang', l);
  };

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  return { lang, setLang, t: T[lang] || T.en, languages: LANGUAGES };
}
