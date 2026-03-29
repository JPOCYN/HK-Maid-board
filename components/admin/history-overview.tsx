"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

type Summary = {
  date: string;
  total: number;
  completed: number;
  skipped: number;
  pending: number;
  completionRate: number;
};

export function HistoryOverview() {
  const { t } = useTranslation();
  const a = t.admin;
  const [rows, setRows] = useState<Summary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/history", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed");
        const payload: Summary[] = await response.json();
        setRows(payload);
      } catch {
        setError("Unable to load history.");
      }
    }
    void load();
  }, []);

  return (
    <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.15rem" }}>{a.last7Days}</div>
      <p style={{ color: "var(--muted)", margin: "0 0 0.85rem", fontSize: "0.88rem" }}>{a.historyHint}</p>
      {error ? <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p> : null}
      <div className="ios-grouped">
        {rows.map((day, idx) => {
          const pct = day.completionRate;
          return (
            <div
              key={day.date}
              className="ios-row"
              style={{ borderTop: idx > 0 ? "1px solid var(--separator)" : "none", gap: "0.6rem" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{day.date}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {day.completed}/{day.total} {a.completedLabel} · {day.skipped} {a.skippedLabel}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    fontVariantNumeric: "tabular-nums",
                    color: pct >= 80 ? "#34c759" : pct >= 50 ? "#ff9500" : "var(--muted)",
                  }}
                >
                  {pct}%
                </span>
                <Link href={`/admin/history/${day.date}`} className="btn btn-secondary" style={{ padding: "0.35rem 0.7rem", fontSize: "0.82rem" }}>
                  {a.viewDay}
                </Link>
              </div>
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--muted)", fontSize: "0.92rem" }}>{a.noHistory}</div>
        ) : null}
      </div>
    </section>
  );
}
