"use client";

import { useTranslation } from "@/lib/i18n/context";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "zh-HK" : "en")}
      className="btn btn-ghost"
      style={{
        padding: compact ? "0.35rem 0.6rem" : "0.45rem 0.8rem",
        fontSize: compact ? "0.82rem" : "0.92rem",
        borderRadius: 980,
      }}
    >
      {locale === "en" ? t.common.zhHK : t.common.en}
    </button>
  );
}
