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
      <main className="container" style={{ maxWidth: 520, padding: "5rem 0", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <LanguageSwitcher compact />
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <h1 style={{ marginTop: 0 }}>{e.autoOpening}</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: "5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <LanguageSwitcher compact />
      </div>
      <form className="card" style={{ padding: "2rem" }} onSubmit={onSubmit}>
        <h1 style={{ marginTop: 0, marginBottom: "0.3rem" }}>{e.title}</h1>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>{e.helperHint}</p>

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
            marginTop: "0.8rem",
            fontSize: "1.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "0.95rem 1rem",
            fontWeight: 700,
          }}
        />

        {error ? <p style={{ color: "#b91c1c", marginBottom: 0 }}>{error}</p> : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || code.length < 7}
          style={{ width: "100%", marginTop: "1rem", minHeight: 54, fontSize: "1.05rem" }}
        >
          {loading ? e.opening : e.submit}
        </button>

        {hasSavedCode ? (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%", marginTop: "0.6rem" }}
            onClick={clearSavedCode}
          >
            {e.changeCode}
          </button>
        ) : null}
      </form>
    </main>
  );
}
