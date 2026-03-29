"use client";

import { useTranslation } from "@/lib/i18n/context";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "zh-HK" : "en")}
      className="btn"
      style={{
        padding: compact ? "0.4rem 0.65rem" : "0.45rem 0.8rem",
        background: "#f1f5f9",
        color: "#334155",
        fontSize: compact ? "0.85rem" : "0.95rem",
        fontWeight: 600,
        borderRadius: compact ? 8 : 10,
      }}
    >
      {locale === "en" ? t.common.zhHK : t.common.en}
    </button>
  );
}
