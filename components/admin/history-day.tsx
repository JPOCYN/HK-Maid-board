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

  const pct = data?.totals.completionRate ?? 0;

  return (
    <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.15rem" }}>{a.detailsFor} {date}</div>
      <p style={{ color: "var(--muted)", margin: "0 0 0.85rem", fontSize: "0.88rem" }}>{a.historyDayHint}</p>
      {error ? <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p> : null}

      <div style={{ display: "flex", gap: "0.65rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="kpi-grid" style={{ flex: 1 }}>
          <div className="kpi-card">
            <div className="kpi-label">{a.total}</div>
            <div className="kpi-value">{data?.totals.total ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.completedLabel}</div>
            <div className="kpi-value" style={{ color: "#34c759" }}>{data?.totals.completed ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.pending}</div>
            <div className="kpi-value">{data?.totals.pending ?? 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">{a.skippedLabel}</div>
            <div className="kpi-value" style={{ color: "#ff9500" }}>{data?.totals.skipped ?? 0}</div>
          </div>
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.6rem",
            fontVariantNumeric: "tabular-nums",
            color: pct >= 80 ? "#34c759" : pct >= 50 ? "#ff9500" : "var(--muted)",
            textAlign: "center",
            minWidth: 60,
          }}
        >
          {pct}%
        </div>
      </div>

      <div className="ios-grouped">
        {(data?.tasks ?? []).map((task, idx) => (
          <div
            key={task.id}
            className="ios-row"
            style={{ borderTop: idx > 0 ? "1px solid var(--separator)" : "none" }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{task.title}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{task.timeBlock.toLowerCase()}</div>
              {task.notes ? <div style={{ marginTop: "0.1rem", color: "var(--muted)", fontSize: "0.78rem" }}>{task.notes}</div> : null}
            </div>
            <StatusPill status={task.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
