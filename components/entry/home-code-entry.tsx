"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/i18n/context";
import { formatHomeCodeInput } from "@/lib/home-code";

const STORAGE_KEY = "maidboard_home_code";

export function HomeCodeEntry() {
  const router = useRouter();
  const { t } = useTranslation();
  const e = t.entry;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedCode, setHasSavedCode] = useState(false);

  const resolveAndRedirect = useCallback(async (inputCode: string, persist = false) => {
    const response = await fetch(`/api/home/resolve?code=${encodeURIComponent(inputCode)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(e.invalidCode);
    }
    const payload: { boardUrl: string; homeCode: string } = await response.json();
    if (persist) {
      localStorage.setItem(STORAGE_KEY, payload.homeCode);
    }
    router.replace(payload.boardUrl);
  }, [router, e.invalidCode]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setAutoLoading(false);
      return;
    }

    setHasSavedCode(true);
    const formatted = formatHomeCodeInput(saved);
    setCode(formatted);

    void resolveAndRedirect(formatted, true)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedCode(false);
        setAutoLoading(false);
      });
  }, [resolveAndRedirect]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resolveAndRedirect(code, true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : e.invalidCode);
    } finally {
      setLoading(false);
    }
  }

  function clearSavedCode() {
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedCode(false);
    setCode("");
    setError(null);
  }

  if (autoLoading) {
    return (
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(120,120,128,0.12)",
              borderTopColor: "#007aff",
              borderRadius: "50%",
              animation: "spin 800ms linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <div style={{ fontWeight: 600, color: "var(--muted)" }}>{e.autoOpening}</div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "2rem",
      }}
    >
      <div style={{ position: "absolute", top: "1rem", right: "1.5rem" }}>
        <LanguageSwitcher compact />
      </div>

      <form
        className="card"
        style={{
          padding: "2.5rem 2rem",
          width: "min(460px, 100%)",
          textAlign: "center",
          animation: "fadeInUp 500ms cubic-bezier(0.22,1,0.36,1) both",
        }}
        onSubmit={onSubmit}
      >
        <h1 style={{ marginTop: 0, marginBottom: "0.3rem", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {e.title}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: "1.5rem", fontSize: "0.92rem" }}>{e.helperHint}</p>

        <input
          className="input"
          placeholder={e.placeholder}
          value={code}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={7}
          onChange={(event) => setCode(formatHomeCodeInput(event.target.value))}
          style={{
            fontSize: "1.8rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "1rem",
            fontWeight: 800,
            borderRadius: 16,
            color: "#007aff",
          }}
        />

        {error ? <p style={{ color: "var(--danger)", marginBottom: 0, fontSize: "0.88rem" }}>{error}</p> : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || code.length < 7}
          style={{ width: "100%", marginTop: "1.2rem", minHeight: 52, fontSize: "1.05rem", borderRadius: 14 }}
        >
          {loading ? e.opening : e.submit}
        </button>

        {hasSavedCode ? (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: "0.6rem", minHeight: 44 }}
            onClick={clearSavedCode}
          >
            {e.changeCode}
          </button>
        ) : null}
      </form>
    </main>
  );
}
