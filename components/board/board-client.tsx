"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const BLOCKS = ["MORNING", "AFTERNOON", "EVENING"] as const;

const blockMeta = {
  MORNING: { label: "Morning", icon: "\u2600\uFE0F", cssIcon: "block-icon-morning" },
  AFTERNOON: { label: "Afternoon", icon: "\u26C5", cssIcon: "block-icon-afternoon" },
  EVENING: { label: "Evening", icon: "\uD83C\uDF19", cssIcon: "block-icon-evening" },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const RING_RADIUS = 33;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? completed / total : 0;
  const offset = RING_CIRC * (1 - pct);

  return (
    <div className="progress-ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle className="progress-ring-bg" cx="40" cy="40" r={RING_RADIUS} />
        <circle
          className="progress-ring-fill"
          cx="40"
          cy="40"
          r={RING_RADIUS}
          strokeDasharray={RING_CIRC}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-number">
          {completed}/{total}
        </span>
        <span className="progress-ring-label">done</span>
      </div>
    </div>
  );
}

function TaskBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; cls: string }> = {
    PENDING: { label: "To do", cls: "task-badge task-badge-pending" },
    COMPLETED: { label: "\u2713 Done", cls: "task-badge task-badge-completed" },
    SKIPPED: { label: "Skipped", cls: "task-badge task-badge-skipped" },
  };
  const entry = map[status];
  return <span className={entry.cls}>{entry.label}</span>;
}

function TaskCard({
  task,
  busy,
  onUpdate,
}: {
  task: Task;
  busy: boolean;
  onUpdate: (id: string, status: TaskStatus) => void;
}) {
  const isDone = task.status === TASK_STATUS.COMPLETED;
  const isSkipped = task.status === TASK_STATUS.SKIPPED;
  const isPending = task.status === TASK_STATUS.PENDING;

  const cardClass = [
    "task-card",
    isDone && "task-card-done",
    isSkipped && "task-card-skipped",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <div className="task-top-row">
        <div>
          <div className="task-title">{task.title}</div>
          {task.notes ? <div className="task-notes">{task.notes}</div> : null}
        </div>
        <TaskBadge status={task.status} />
      </div>

      <div className="task-actions">
        {isPending ? (
          <>
            <button
              className="task-btn task-btn-complete"
              disabled={busy}
              onClick={() => onUpdate(task.id, TASK_STATUS.COMPLETED)}
            >
              <span className="task-btn-icon">{"\u2713"}</span>
              Complete
            </button>
            <button
              className="task-btn task-btn-skip"
              disabled={busy}
              onClick={() => onUpdate(task.id, TASK_STATUS.SKIPPED)}
            >
              <span className="task-btn-icon">{"\u279C"}</span>
              Skip
            </button>
          </>
        ) : (
          <button
            className="task-btn task-btn-undo"
            disabled={busy}
            onClick={() => onUpdate(task.id, TASK_STATUS.PENDING)}
          >
            <span className="task-btn-icon">{"\u21A9"}</span>
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

export function BoardClient() {
  const [data, setData] = useState<BoardPayload | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(formatTime);
  const [loaded, setLoaded] = useState(false);
  const lastFetch = useRef(0);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch("/api/board/today", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load board.");
      const payload: BoardPayload = await response.json();
      setData(payload);
      setError(null);
      lastFetch.current = Date.now();
    } catch {
      setError("Unable to sync right now. Retrying...");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void fetchBoard();
    const dataTimer = setInterval(() => void fetchBoard(), 10000);
    const clockTimer = setInterval(() => setClock(formatTime()), 1000);
    return () => {
      clearInterval(dataTimer);
      clearInterval(clockTimer);
    };
  }, [fetchBoard]);

  const allTasks = useMemo(() => {
    if (!data) return [];
    return [...data.groups.MORNING, ...data.groups.AFTERNOON, ...data.groups.EVENING];
  }, [data]);

  const allDone = useMemo(() => {
    if (!data || data.progress.total === 0) return false;
    return data.progress.pending === 0;
  }, [data]);

  async function updateStatus(taskId: string, status: TaskStatus) {
    if (!data) return;
    setBusyId(taskId);

    const previous = data;
    const next = structuredClone(previous);
    for (const block of BLOCKS) {
      const task = next.groups[block].find((item) => item.id === taskId);
      if (task) task.status = status;
    }
    const completed = BLOCKS.reduce(
      (sum, b) => sum + next.groups[b].filter((t) => t.status === TASK_STATUS.COMPLETED).length,
      0,
    );
    const skipped = BLOCKS.reduce(
      (sum, b) => sum + next.groups[b].filter((t) => t.status === TASK_STATUS.SKIPPED).length,
      0,
    );
    next.progress = {
      ...next.progress,
      completed,
      skipped,
      pending: next.progress.total - completed - skipped,
      completionRate: next.progress.total > 0 ? Math.round((completed / next.progress.total) * 100) : 0,
    };
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

  if (!loaded) {
    return (
      <main className="board">
        <div className="board-loading">
          <div className="board-spinner" />
          <span>Loading tasks...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="board">
      <header className="board-header">
        <div className="board-header-left">
          <div className="board-greeting">{getGreeting()}</div>
          <div className="board-date">{formatDate()}</div>
        </div>
        <div className="board-header-right">
          <div className="board-clock">{clock}</div>
          <ProgressRing
            completed={data?.progress.completed ?? 0}
            total={data?.progress.total ?? 0}
          />
        </div>
      </header>

      {error ? <div className="board-error">{error}</div> : null}

      <div className="board-content">
        {allDone ? (
          <div className="board-all-done">
            <div className="board-all-done-icon">{"\uD83C\uDF89"}</div>
            <div className="board-all-done-title">All tasks completed!</div>
            <div className="board-all-done-sub">Great job today. Enjoy the rest of the day.</div>
          </div>
        ) : null}

        {allTasks.length === 0 && !allDone ? (
          <div className="board-empty">
            <div className="board-empty-icon">{"\uD83D\uDCCB"}</div>
            <div className="board-empty-text">No tasks scheduled for today.</div>
          </div>
        ) : null}

        {allTasks.length > 0 ? (
          <div className="board-columns">
            {BLOCKS.map((block) => {
              const tasks = data?.groups[block] ?? [];
              const meta = blockMeta[block];
              const done = tasks.filter((t) => t.status !== TASK_STATUS.PENDING).length;

              return (
                <section key={block} className="block-column">
                  <div className="block-header">
                    <div className={`block-icon ${meta.cssIcon}`}>{meta.icon}</div>
                    <div className="block-title">{meta.label}</div>
                    <div className="block-count">
                      {done}/{tasks.length}
                    </div>
                  </div>

                  {tasks.length > 0 ? (
                    tasks.map((task, i) => (
                      <div key={task.id} style={{ animationDelay: `${i * 60}ms` }}>
                        <TaskCard
                          task={task}
                          busy={busyId === task.id}
                          onUpdate={updateStatus}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="block-empty">Nothing here</div>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="board-sync">
        <span className={`sync-dot ${error ? "sync-dot-error" : ""}`} />
        {error ? "Offline" : "Live"}
      </div>
    </main>
  );
}
