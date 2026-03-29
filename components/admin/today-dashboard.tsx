"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { useTranslation } from "@/lib/i18n/context";
import { TaskStatus, TimeBlock } from "@/lib/task-constants";

const HOME_CODE_CACHE_KEY = "maidboard:admin:home-code";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  timeBlock: TimeBlock;
  completedAt: string | null;
};

type Response = {
  progress: {
    date: string;
    total: number;
    completed: number;
    skipped: number;
    pending: number;
    completionRate: number;
  };
  tasks: Task[];
  boardToken: string | null;
  homeCode: string | null;
};

export function TodayDashboard({ boardToken }: { boardToken?: string }) {
  const { t } = useTranslation();
  const a = t.admin;
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [resettingUrl, setResettingUrl] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [cachedHomeCode, setCachedHomeCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HOME_CODE_CACHE_KEY);
      if (stored) setCachedHomeCode(stored);
    } catch {
      // Ignore storage errors in private mode or restricted browsers.
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/today", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed");
      const payload: Response = await response.json();
      setData(payload);
      if (payload.homeCode) {
        setCachedHomeCode(payload.homeCode);
        try {
          window.localStorage.setItem(HOME_CODE_CACHE_KEY, payload.homeCode);
        } catch {
          // Ignore storage write failures.
        }
      }
      setError(null);
    } catch {
      setError("Unable to load dashboard data right now.");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 10000);
    return () => clearInterval(timer);
  }, [load]);

  function copyBoardUrl() {
    const token = data?.boardToken ?? boardToken;
    if (!token) return;
    const url = `${window.location.origin}/board/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyHomeCode() {
    const code = data?.homeCode ?? cachedHomeCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  async function resetBoardUrl() {
    const confirmed = window.confirm(a.confirmResetUrl);
    if (!confirmed) return;
    setResettingUrl(true);
    try {
      const response = await fetch("/api/admin/board-url/reset", { method: "POST" });
      if (!response.ok) throw new Error("Failed");
      await load();
    } catch {
      setError("Could not reset board URL.");
    } finally {
      setResettingUrl(false);
    }
  }

  async function regenerateHomeCode() {
    const confirmed = window.confirm(a.confirmRegenerateCode);
    if (!confirmed) return;
    setRegenerating(true);
    try {
      const response = await fetch("/api/admin/home-code/regenerate", { method: "POST" });
      if (!response.ok) throw new Error("Failed");
      const payload = (await response.json()) as { homeCode?: string };
      if (payload.homeCode) {
        setCachedHomeCode(payload.homeCode);
        try {
          window.localStorage.setItem(HOME_CODE_CACHE_KEY, payload.homeCode);
        } catch {
          // Ignore storage write failures.
        }
      }
      await load();
    } catch {
      setError("Could not regenerate home code.");
    } finally {
      setRegenerating(false);
    }
  }

  const displayHomeCode = data?.homeCode ?? cachedHomeCode;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "0.6rem" }}>{a.quickGuideTitle}</h3>
        <div style={{ display: "grid", gap: "0.35rem", color: "var(--muted)", fontSize: "0.95rem" }}>
          <div>1. {a.quickGuideStep1}</div>
          <div>2. {a.quickGuideStep2}</div>
          <div>3. {a.quickGuideStep3}</div>
        </div>
      </section>

      {displayHomeCode ? (
        <section className="card" style={{ padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{a.yourHomeCode}</h3>
          <p style={{ color: "var(--muted)", marginTop: "-0.2rem", fontSize: "0.9rem" }}>{a.homeCodeHint}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <code
              style={{
                background: "#f1f5f9",
                padding: "0.5rem 0.85rem",
                borderRadius: 8,
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {displayHomeCode}
            </code>
            <button type="button" className="btn btn-secondary" onClick={copyHomeCode}>
              {copiedCode ? a.copied : a.copyUrl}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={regenerateHomeCode}
              disabled={regenerating}
            >
              {regenerating ? a.regenerating : a.regenerateCode}
            </button>
          </div>
        </section>
      ) : null}

      {(data?.boardToken ?? boardToken) ? (
        <section className="card" style={{ padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{a.boardUrl}</h3>
          <p style={{ color: "var(--muted)", marginTop: "-0.2rem", fontSize: "0.9rem" }}>
            {a.boardUrlHint} {a.boardUrlSimpleHint}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <code style={{ background: "#f1f5f9", padding: "0.4rem 0.7rem", borderRadius: 8, fontSize: "0.9rem", wordBreak: "break-all" }}>
              {typeof window !== "undefined"
                ? `${window.location.origin}/board/${data?.boardToken ?? boardToken}`
                : `/board/${data?.boardToken ?? boardToken}`}
            </code>
            <button type="button" className="btn btn-secondary" onClick={copyBoardUrl}>
              {copied ? a.copied : a.copyUrl}
            </button>
            <button type="button" className="btn btn-danger" onClick={resetBoardUrl} disabled={resettingUrl}>
              {resettingUrl ? a.saving : a.resetUrl}
            </button>
          </div>
        </section>
      ) : null}

      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{a.todayProgress}</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">{a.total}</div>
            <div className="kpi-value">{data?.progress.total ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.completedLabel}</div>
            <div className="kpi-value">{data?.progress.completed ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.pending}</div>
            <div className="kpi-value">{data?.progress.pending ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.skippedLabel}</div>
            <div className="kpi-value">{data?.progress.skipped ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.completion}</div>
            <div className="kpi-value">{data?.progress.completionRate ?? 0}%</div>
          </div>
        </div>
        {error ? <p style={{ color: "#9b1c1c", marginBottom: 0 }}>{error}</p> : null}
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{a.liveTaskFeed}</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {(data?.tasks ?? []).map((task) => (
            <article key={task.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{task.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.86rem" }}>{task.timeBlock.toLowerCase()}</div>
                </div>
                <StatusPill status={task.status} />
              </div>
            </article>
          ))}
          {(data?.tasks?.length ?? 0) === 0 ? (
            <div style={{ color: "var(--muted)" }}>{a.noTasksToday}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
