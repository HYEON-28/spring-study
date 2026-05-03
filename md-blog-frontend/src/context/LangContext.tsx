import { createContext, useContext, useState, useEffect } from "react";
import type { Lang } from "../i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const STORAGE_KEY = "md-blog.lang";
const DEFAULT_LANG: Lang = "ja";
const VALID_LANGS: Lang[] = ["ko", "en", "ja", "zh"];

function readStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && VALID_LANGS.includes(stored as Lang)) return stored as Lang;
  return DEFAULT_LANG;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && VALID_LANGS.includes(e.newValue as Lang)) {
        setLangState(e.newValue as Lang);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLang = (next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    setLangState(next);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
