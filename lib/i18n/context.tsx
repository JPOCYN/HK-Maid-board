"use client";

import { createContext, useContext, useSyncExternalStore, useState, useCallback, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

const STORAGE_KEY = "maidboard_lang";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in dictionaries) return saved;
  } catch {
    /* ignore */
  }
  return "en";
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: dictionaries.en,
});

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

function getSnapshot(): Locale {
  return getStoredLocale();
}

function getServerSnapshot(): Locale {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const externalLocale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [locale, setLocaleState] = useState<Locale>(externalLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      listeners.forEach((l) => l());
    } catch {
      /* ignore */
    }
  }, []);

  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
