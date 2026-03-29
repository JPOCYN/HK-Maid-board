"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
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
};

export function TodayDashboard() {
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Today&apos;s Progress</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total</div>
            <div className="kpi-value">{data?.progress.total ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Completed</div>
            <div className="kpi-value">{data?.progress.completed ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value">{data?.progress.pending ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Skipped</div>
            <div className="kpi-value">{data?.progress.skipped ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Completion</div>
            <div className="kpi-value">{data?.progress.completionRate ?? 0}%</div>
          </div>
        </div>
        {error ? <p style={{ color: "#9b1c1c", marginBottom: 0 }}>{error}</p> : null}
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Live Task Feed</h2>
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
            <div style={{ color: "var(--muted)" }}>No tasks generated for today.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
