"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Summary = {
  date: string;
  total: number;
  completed: number;
  skipped: number;
  pending: number;
  completionRate: number;
};

export function HistoryOverview() {
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
    <section className="card" style={{ padding: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>Last 7 Days</h2>
      {error ? <p style={{ color: "#9b1c1c" }}>{error}</p> : null}
      <div style={{ display: "grid", gap: "0.65rem" }}>
        {rows.map((day) => (
          <article key={day.date} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
              <div>
                <strong>{day.date}</strong>
                <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  {day.completed}/{day.total} completed · {day.skipped} skipped · {day.pending} pending
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div className="pill pill-completed">{day.completionRate}%</div>
                <Link href={`/admin/history/${day.date}`} className="btn btn-secondary">
                  View day
                </Link>
              </div>
            </div>
          </article>
        ))}
        {rows.length === 0 ? <p style={{ color: "var(--muted)" }}>No historical records yet.</p> : null}
      </div>
    </section>
  );
}
