"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { useTranslation } from "@/lib/i18n/context";
import { TaskStatus, TimeBlock } from "@/lib/task-constants";

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

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/today", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed");
      const payload: Response = await response.json();
      setData(payload);
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
    if (!data?.homeCode) return;
    navigator.clipboard.writeText(data.homeCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  async function resetBoardUrl() {
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
    setRegenerating(true);
    try {
      const response = await fetch("/api/admin/home-code/regenerate", { method: "POST" });
      if (!response.ok) throw new Error("Failed");
      await load();
    } catch {
      setError("Could not regenerate home code.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {data?.homeCode ? (
        <section className="card" style={{ padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{a.yourHomeCode}</h3>
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
              {data.homeCode}
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
          <p style={{ color: "var(--muted)", marginTop: "-0.2rem", fontSize: "0.9rem" }}>{a.boardUrlHint}</p>
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
