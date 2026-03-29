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
  const [copiedEntry, setCopiedEntry] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resettingUrl, setResettingUrl] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [cachedHomeCode, setCachedHomeCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HOME_CODE_CACHE_KEY);
      if (stored) setCachedHomeCode(stored);
    } catch {
      /* private mode */
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
        try { window.localStorage.setItem(HOME_CODE_CACHE_KEY, payload.homeCode); } catch { /* */ }
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

  function copyText(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
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
        try { window.localStorage.setItem(HOME_CODE_CACHE_KEY, payload.homeCode); } catch { /* */ }
      }
      await load();
    } catch {
      setError("Could not regenerate home code.");
    } finally {
      setRegenerating(false);
    }
  }

  const displayHomeCode = data?.homeCode ?? cachedHomeCode;
  const currentToken = data?.boardToken ?? boardToken;
  const pct = data?.progress.completionRate ?? 0;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const entryUrl = `${origin}/go`;
  const boardUrl = currentToken ? `${origin}/board/${currentToken}` : "";

  return (
    <div style={{ display: "grid", gap: "0.85rem" }}>
      {/* Quick Start */}
      <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.55rem", color: "#1c1c1e" }}>
          {a.quickGuideTitle}
        </div>
        <div style={{ display: "grid", gap: "0.3rem" }}>
          {[a.quickGuideStep1, a.quickGuideStep2, a.quickGuideStep3].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#007aff",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: "0.92rem", color: "#636366" }}>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Combined: Share with Helper */}
      {(displayHomeCode || currentToken) ? (
        <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.15rem" }}>{a.shareTitle}</div>
          <p style={{ color: "var(--muted)", margin: "0 0 1rem", fontSize: "0.88rem" }}>{a.shareHint}</p>

          {/* Option 1: Entry URL + Home Code */}
          {displayHomeCode ? (
            <div
              style={{
                background: "rgba(0,122,255,0.04)",
                borderRadius: 16,
                padding: "1rem 1.1rem",
                marginBottom: "0.75rem",
                border: "1px solid rgba(0,122,255,0.1)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#007aff", marginBottom: "0.35rem" }}>
                {a.optionCodeTitle}
              </div>
              <p style={{ color: "#636366", fontSize: "0.85rem", margin: "0 0 0.75rem", lineHeight: 1.5 }}>
                {a.optionCodeDesc}
              </p>

              {/* Entry URL row */}
              <div style={{ marginBottom: "0.6rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                  {a.optionCodeEntry}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <code
                    style={{
                      background: "#fff",
                      padding: "0.45rem 0.8rem",
                      borderRadius: 10,
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#007aff",
                      letterSpacing: "0.01em",
                      border: "1px solid rgba(0,122,255,0.12)",
                    }}
                  >
                    {entryUrl || "/go"}
                  </code>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.35rem 0.7rem" }} onClick={() => copyText(entryUrl || "/go", setCopiedEntry)}>
                    {copiedEntry ? a.copied : a.copyUrl}
                  </button>
                </div>
              </div>

              {/* Home Code row */}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                  {a.optionCodeLabel}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <code
                    style={{
                      background: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: 12,
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      color: "#007aff",
                      border: "1px solid rgba(0,122,255,0.12)",
                    }}
                  >
                    {displayHomeCode}
                  </code>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.35rem 0.7rem" }} onClick={() => copyText(displayHomeCode!, setCopiedCode)}>
                    {copiedCode ? a.copied : a.copyUrl}
                  </button>
                  <button type="button" className="btn btn-danger" style={{ fontSize: "0.82rem", padding: "0.35rem 0.7rem" }} onClick={regenerateHomeCode} disabled={regenerating}>
                    {regenerating ? a.regenerating : a.regenerateCode}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Option 2: Direct Board Link */}
          {currentToken ? (
            <div
              style={{
                background: "rgba(120,120,128,0.04)",
                borderRadius: 16,
                padding: "1rem 1.1rem",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#636366", marginBottom: "0.35rem" }}>
                {a.optionLinkTitle}
              </div>
              <p style={{ color: "#8e8e93", fontSize: "0.85rem", margin: "0 0 0.65rem", lineHeight: 1.5 }}>
                {a.optionLinkDesc}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <code
                  style={{
                    background: "rgba(120,120,128,0.06)",
                    padding: "0.4rem 0.7rem",
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    wordBreak: "break-all",
                    color: "#636366",
                  }}
                >
                  {boardUrl || `/board/${currentToken}`}
                </code>
                <button type="button" className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "0.35rem 0.7rem" }} onClick={() => copyText(boardUrl, setCopiedLink)}>
                  {copiedLink ? a.copied : a.copyUrl}
                </button>
                <button type="button" className="btn btn-danger" style={{ fontSize: "0.82rem", padding: "0.35rem 0.7rem" }} onClick={resetBoardUrl} disabled={resettingUrl}>
                  {resettingUrl ? a.saving : a.resetUrl}
                </button>
              </div>
              <p style={{ color: "#aeaeb2", fontSize: "0.78rem", margin: "0.5rem 0 0", lineHeight: 1.4 }}>
                {a.optionLinkWarn}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Today's Progress */}
      <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{a.todayProgress}</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              color: pct >= 80 ? "#34c759" : pct >= 50 ? "#ff9500" : "#8e8e93",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pct}%
          </div>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "rgba(120,120,128,0.08)",
            marginBottom: "0.85rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              width: `${pct}%`,
              background: pct >= 80 ? "#34c759" : pct >= 50 ? "#ff9500" : "#007aff",
              transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">{a.total}</div>
            <div className="kpi-value">{data?.progress.total ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.completedLabel}</div>
            <div className="kpi-value" style={{ color: "#34c759" }}>{data?.progress.completed ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.pending}</div>
            <div className="kpi-value">{data?.progress.pending ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.skippedLabel}</div>
            <div className="kpi-value" style={{ color: "#ff9500" }}>{data?.progress.skipped ?? 0}</div>
          </div>
        </div>
        {error ? <p style={{ color: "var(--danger)", marginBottom: 0, marginTop: "0.6rem", fontSize: "0.88rem" }}>{error}</p> : null}
      </section>

      {/* Task List */}
      <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.65rem" }}>{a.liveTaskFeed}</div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {(data?.tasks ?? []).map((task) => (
            <div
              key={task.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.65rem 0.75rem",
                background: "rgba(120,120,128,0.04)",
                borderRadius: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{task.title}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{task.timeBlock.toLowerCase()}</div>
              </div>
              <StatusPill status={task.status} />
            </div>
          ))}
          {(data?.tasks?.length ?? 0) === 0 ? (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: "1.5rem 0", fontSize: "0.92rem" }}>{a.noTasksToday}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
