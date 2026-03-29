"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { useTranslation } from "@/lib/i18n/context";
import { TaskStatus } from "@/lib/task-constants";

type Detail = {
  date: string;
  totals: {
    total: number;
    completed: number;
    skipped: number;
    pending: number;
    completionRate: number;
  };
  tasks: {
    id: string;
    title: string;
    notes: string | null;
    status: TaskStatus;
    timeBlock: string;
    completedAt: string | null;
  }[];
};

export function HistoryDay({ date }: { date: string }) {
  const { t } = useTranslation();
  const a = t.admin;
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/admin/history/${date}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed");
        const payload: Detail = await response.json();
        setData(payload);
      } catch {
        setError("Unable to load this day.");
      }
    }
    void load();
  }, [date]);

  return (
    <section className="card" style={{ padding: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>{a.detailsFor} {date}</h2>
      {error ? <p style={{ color: "#9b1c1c" }}>{error}</p> : null}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">{a.total}</div>
          <div className="kpi-value">{data?.totals.total ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{a.completedLabel}</div>
          <div className="kpi-value">{data?.totals.completed ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{a.pending}</div>
          <div className="kpi-value">{data?.totals.pending ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{a.skippedLabel}</div>
          <div className="kpi-value">{data?.totals.skipped ?? 0}</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: "0.65rem", marginTop: "1rem" }}>
        {(data?.tasks ?? []).map((task) => (
          <article key={task.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{task.title}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{task.timeBlock.toLowerCase()}</div>
                {task.notes ? <div style={{ marginTop: "0.25rem", color: "var(--muted)" }}>{task.notes}</div> : null}
              </div>
              <StatusPill status={task.status} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
