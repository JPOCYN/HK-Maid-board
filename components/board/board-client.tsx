"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS, TaskStatus } from "@/lib/task-constants";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  timeBlock: "MORNING" | "AFTERNOON" | "EVENING";
  completedAt: string | null;
};

type BoardPayload = {
  household: string;
  progress: {
    total: number;
    completed: number;
    skipped: number;
    pending: number;
    completionRate: number;
  };
  groups: Record<"MORNING" | "AFTERNOON" | "EVENING", Task[]>;
};

const blockTitle = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
};

export function BoardClient() {
  const [data, setData] = useState<BoardPayload | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch("/api/board/today", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load board.");
      const payload: BoardPayload = await response.json();
      setData(payload);
      setError(null);
    } catch {
      setError("Unable to sync right now. Retrying...");
    }
  }, []);

  useEffect(() => {
    void fetchBoard();
    const timer = setInterval(() => {
      void fetchBoard();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchBoard]);

  const allTasks = useMemo(() => {
    if (!data) return [];
    return [...data.groups.MORNING, ...data.groups.AFTERNOON, ...data.groups.EVENING];
  }, [data]);

  async function updateStatus(taskId: string, status: TaskStatus) {
    if (!data) return;
    setBusyId(taskId);

    const previous = data;
    const next = structuredClone(previous);
    for (const block of ["MORNING", "AFTERNOON", "EVENING"] as const) {
      const task = next.groups[block].find((item) => item.id === taskId);
      if (task) task.status = status;
    }
    setData(next);

    try {
      const response = await fetch(`/api/board/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Update failed");
      await fetchBoard();
    } catch {
      setData(previous);
      setError("Could not update task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1rem",
        background: "linear-gradient(180deg, #eef3ff 0%, #f8faff 100%)",
      }}
    >
      <div className="container" style={{ width: "min(1400px, 96vw)" }}>
        <header className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Today&apos;s Tasks</h1>
              <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
                {data?.household ?? "Household"} · live board
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                {data?.progress.completed ?? 0}/{data?.progress.total ?? 0}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>completed</div>
            </div>
          </div>
          <div
            style={{
              height: 10,
              marginTop: "0.8rem",
              borderRadius: 999,
              background: "#dbe7ff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${data?.progress.completionRate ?? 0}%`,
                background: "linear-gradient(90deg, #2f6fed 0%, #1a936f 100%)",
                transition: "width 180ms ease",
              }}
            />
          </div>
          {error ? <p style={{ color: "#9b1c1c", marginBottom: 0 }}>{error}</p> : null}
        </header>

        <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {(["MORNING", "AFTERNOON", "EVENING"] as const).map((block) => (
            <article key={block} className="card" style={{ padding: "0.9rem" }}>
              <h2 style={{ margin: "0 0 0.8rem", fontSize: "1.35rem" }}>{blockTitle[block]}</h2>
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {(data?.groups[block] ?? []).map((task) => (
                  <div key={task.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{task.title}</div>
                        {task.notes ? <p style={{ margin: "0.2rem 0", color: "var(--muted)" }}>{task.notes}</p> : null}
                      </div>
                      <StatusPill status={task.status} />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                      <button
                        className="btn"
                        style={{
                          background: "#def7ec",
                          color: "#065f46",
                          fontSize: "1rem",
                          minHeight: 48,
                          flex: 1,
                        }}
                        disabled={busyId === task.id}
                        onClick={() => updateStatus(task.id, TASK_STATUS.COMPLETED)}
                      >
                        Complete
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: "#fff0db",
                          color: "#92400e",
                          fontSize: "1rem",
                          minHeight: 48,
                          flex: 1,
                        }}
                        disabled={busyId === task.id}
                        onClick={() => updateStatus(task.id, TASK_STATUS.SKIPPED)}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
                {(data?.groups[block]?.length ?? 0) === 0 ? (
                  <div style={{ color: "var(--muted)", fontSize: "0.95rem" }}>No tasks in this block.</div>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        {allTasks.length === 0 ? (
          <div className="card" style={{ marginTop: "1rem", padding: "1rem", textAlign: "center", color: "var(--muted)" }}>
            No tasks for today.
          </div>
        ) : null}
      </div>
    </main>
  );
}
