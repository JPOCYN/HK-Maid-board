"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
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
  progress: { total: number; completed: number; skipped: number; pending: number; completionRate: number };
  groups: Record<"MORNING" | "AFTERNOON" | "EVENING", Task[]>;
};

const BLOCKS = ["MORNING", "AFTERNOON", "EVENING"] as const;
const RING_RADIUS = 33;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const LAYOUT_KEY = "maidboard:board:layout";

type BoardLayout = "horizontal" | "vertical";

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? completed / total : 0;
  const offset = RING_CIRC * (1 - pct);
  return (
    <div className="progress-ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007aff" />
            <stop offset="100%" stopColor="#34c759" />
          </linearGradient>
        </defs>
        <circle className="progress-ring-bg" cx="40" cy="40" r={RING_RADIUS} />
        <circle className="progress-ring-fill" cx="40" cy="40" r={RING_RADIUS} strokeDasharray={RING_CIRC} strokeDashoffset={offset} />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-number">{completed}/{total}</span>
        <span className="progress-ring-label">{"\u2713"}</span>
      </div>
    </div>
  );
}

function TaskCard({ task, busy, onUpdate }: { task: Task; busy: boolean; onUpdate: (id: string, s: TaskStatus) => void }) {
  const { t } = useTranslation();
  const b = t.board;
  const isDone = task.status === TASK_STATUS.COMPLETED;
  const isSkipped = task.status === TASK_STATUS.SKIPPED;
  const isPending = task.status === TASK_STATUS.PENDING;
  const cls = ["task-card", isDone && "task-card-done", isSkipped && "task-card-skipped"].filter(Boolean).join(" ");

  const badgeMap: Record<TaskStatus, { label: string; cls: string }> = {
    PENDING: { label: b.todo, cls: "task-badge task-badge-pending" },
    COMPLETED: { label: b.completed, cls: "task-badge task-badge-completed" },
    SKIPPED: { label: b.skipped, cls: "task-badge task-badge-skipped" },
  };
  const badge = badgeMap[task.status];

  return (
    <div className={cls}>
      <div className="task-top-row">
        <div>
          <div className="task-title">{task.title}</div>
          {task.notes ? <div className="task-notes">{task.notes}</div> : null}
        </div>
        <span className={badge.cls}>{badge.label}</span>
      </div>
      <div className="task-actions">
        {isPending ? (
          <>
            <button className="task-btn task-btn-complete" disabled={busy} onClick={() => onUpdate(task.id, TASK_STATUS.COMPLETED)}>
              <span className="task-btn-icon">{"\u2713"}</span>{b.complete}
            </button>
            <button className="task-btn task-btn-skip" disabled={busy} onClick={() => onUpdate(task.id, TASK_STATUS.SKIPPED)}>
              <span className="task-btn-icon">{"\u279C"}</span>{b.skip}
            </button>
          </>
        ) : (
          <button className="task-btn task-btn-undo" disabled={busy} onClick={() => onUpdate(task.id, TASK_STATUS.PENDING)}>
            <span className="task-btn-icon">{"\u21A9"}</span>{b.undo}
          </button>
        )}
      </div>
    </div>
  );
}

function LayoutToggle({ layout, onChange, labels }: { layout: BoardLayout; onChange: (l: BoardLayout) => void; labels: { vertical: string; horizontal: string } }) {
  return (
    <div className="board-layout-toggle">
      <button
        type="button"
        className={`board-layout-btn ${layout === "vertical" ? "board-layout-btn-active" : ""}`}
        onClick={() => onChange("vertical")}
      >
        {"\u2630"} {labels.vertical}
      </button>
      <button
        type="button"
        className={`board-layout-btn ${layout === "horizontal" ? "board-layout-btn-active" : ""}`}
        onClick={() => onChange("horizontal")}
      >
        {"\u2637"} {labels.horizontal}
      </button>
    </div>
  );
}

export function BoardClient({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const b = t.board;

  const [data, setData] = useState<BoardPayload | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [layout, setLayout] = useState<BoardLayout>("horizontal");
  const lastFetch = useRef(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LAYOUT_KEY) as BoardLayout | null;
      if (saved === "vertical" || saved === "horizontal") setLayout(saved);
    } catch { /* private mode */ }
  }, []);

  function handleLayoutChange(next: BoardLayout) {
    setLayout(next);
    try { window.localStorage.setItem(LAYOUT_KEY, next); } catch { /* */ }
  }

  function formatTime() {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  function formatDate() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return b.greetingMorning;
    if (hour < 17) return b.greetingAfternoon;
    return b.greetingEvening;
  }, [b]);

  const blockMeta = useMemo(
    () => ({
      MORNING: { label: b.morning, icon: "\u2600\uFE0F", css: "block-icon-morning" },
      AFTERNOON: { label: b.afternoon, icon: "\u26C5", css: "block-icon-afternoon" },
      EVENING: { label: b.evening, icon: "\uD83C\uDF19", css: "block-icon-evening" },
    }),
    [b],
  );

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/${slug}/today`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(null);
      lastFetch.current = Date.now();
    } catch {
      setError(b.syncError);
    } finally {
      setLoaded(true);
    }
  }, [slug, b.syncError]);

  useEffect(() => {
    setClock(formatTime());
    void fetchBoard();
    const d = setInterval(() => void fetchBoard(), 10000);
    const c = setInterval(() => setClock(formatTime()), 1000);
    return () => { clearInterval(d); clearInterval(c); };
  }, [fetchBoard]);

  const allTasks = useMemo(() => (data ? [...data.groups.MORNING, ...data.groups.AFTERNOON, ...data.groups.EVENING] : []), [data]);
  const allDone = useMemo(() => (data && data.progress.total > 0 && data.progress.pending === 0), [data]);

  async function updateStatus(taskId: string, status: TaskStatus) {
    if (!data) return;
    setBusyId(taskId);
    const prev = data;
    const next = structuredClone(prev);
    for (const bl of BLOCKS) { const t = next.groups[bl].find((x) => x.id === taskId); if (t) t.status = status; }
    const comp = BLOCKS.reduce((s, bl) => s + next.groups[bl].filter((x) => x.status === TASK_STATUS.COMPLETED).length, 0);
    const skip = BLOCKS.reduce((s, bl) => s + next.groups[bl].filter((x) => x.status === TASK_STATUS.SKIPPED).length, 0);
    next.progress = { ...next.progress, completed: comp, skipped: skip, pending: next.progress.total - comp - skip, completionRate: next.progress.total > 0 ? Math.round((comp / next.progress.total) * 100) : 0 };
    setData(next);
    try {
      const res = await fetch(`/api/board/${slug}/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      await fetchBoard();
    } catch { setData(prev); setError(b.updateError); }
    finally { setBusyId(null); }
  }

  function exitBoard() {
    const confirmed = window.confirm(b.exitConfirm);
    if (!confirmed) return;
    localStorage.removeItem("maidboard_home_code");
    window.location.href = "/go";
  }

  if (!loaded) return <main className="board"><div className="board-loading"><div className="board-spinner" /><span>{b.loading}</span></div></main>;

  return (
    <main className="board">
      {/* Optimized topbar: left=greeting+exit, center=clock+date, right=layout+lang+progress */}
      <header className="board-header">
        <div className="board-header-left">
          <div className="board-greeting">{greeting}</div>
          <button
            type="button"
            className="board-exit-btn"
            onClick={exitBoard}
          >
            {"\u2190"} {b.exitBoard}
          </button>
        </div>

        <div className="board-header-center">
          <div className="board-clock">{clock}</div>
          <div className="board-date">{formatDate()}</div>
        </div>

        <div className="board-header-right">
          <LayoutToggle
            layout={layout}
            onChange={handleLayoutChange}
            labels={{ vertical: b.layoutVertical, horizontal: b.layoutHorizontal }}
          />
          <LanguageSwitcher compact />
          <ProgressRing completed={data?.progress.completed ?? 0} total={data?.progress.total ?? 0} />
        </div>
      </header>

      {error ? <div className="board-error">{error}</div> : null}

      <div className="board-content">
        {allDone ? (
          <div className="board-all-done">
            <div className="board-all-done-icon">{"\uD83C\uDF89"}</div>
            <div className="board-all-done-title">{b.allDoneTitle}</div>
            <div className="board-all-done-sub">{b.allDoneSub}</div>
          </div>
        ) : null}

        {allTasks.length === 0 && !allDone ? (
          <div className="board-empty">
            <div className="board-empty-icon">{"\uD83D\uDCCB"}</div>
            <div className="board-empty-text">{b.noTasks}</div>
          </div>
        ) : null}

        {allTasks.length > 0 ? (
          <div className={layout === "horizontal" ? "board-columns" : "board-columns-vertical"}>
            {BLOCKS.map((block) => {
              const tasks = data?.groups[block] ?? [];
              const meta = blockMeta[block];
              const done = tasks.filter((x) => x.status !== TASK_STATUS.PENDING).length;
              return (
                <section key={block} className="block-column">
                  <div className="block-header">
                    <div className={`block-icon ${meta.css}`}>{meta.icon}</div>
                    <div className="block-title">{meta.label}</div>
                    <div className="block-count">{done}/{tasks.length}</div>
                  </div>
                  {tasks.length > 0 ? tasks.map((task, i) => (
                    <div key={task.id} style={{ animationDelay: `${i * 60}ms` }}>
                      <TaskCard task={task} busy={busyId === task.id} onUpdate={updateStatus} />
                    </div>
                  )) : <div className="block-empty">{b.nothingHere}</div>}
                </section>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="board-sync">
        <span className={`sync-dot ${error ? "sync-dot-error" : ""}`} />
        {error ? b.offline : b.live}
      </div>
    </main>
  );
}
