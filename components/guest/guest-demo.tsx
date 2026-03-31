"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { TIME_BLOCK, TimeBlock } from "@/lib/task-constants";

type GuestTask = {
  id: string;
  title: string;
  timeBlock: TimeBlock;
};

const STORAGE_KEY = "maidboard_guest_tasks";
const ONBOARDING_KEY = "maidboard_guest_onboarding_seen";

const presetKeys = [
  "presetPrepareBreakfast",
  "presetDishwashing",
  "presetLaundry",
  "presetMopFloor",
  "presetMarketShopping",
  "presetTrash",
] as const;

function readGuestTasks(): GuestTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestTask[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.title && item?.timeBlock);
  } catch {
    return [];
  }
}

function saveGuestTasks(tasks: GuestTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

export function GuestDemo() {
  const router = useRouter();
  const { t } = useTranslation();
  const g = t.guest;
  const a = t.admin;
  const b = t.board;

  const [tasks, setTasks] = useState<GuestTask[]>([]);
  const [manualTitle, setManualTitle] = useState("");
  const [manualTimeBlock, setManualTimeBlock] = useState<TimeBlock>(TIME_BLOCK.MORNING);
  const [quickTimeBlock, setQuickTimeBlock] = useState<TimeBlock>(TIME_BLOCK.MORNING);
  const [showTimedReminder, setShowTimedReminder] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [startingGuestMode, setStartingGuestMode] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    setTasks(readGuestTasks());
    try {
      setShowOnboarding(!window.localStorage.getItem(ONBOARDING_KEY));
    } catch {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    saveGuestTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowTimedReminder(true), 10 * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (tasks.length === 0) return;
      event.preventDefault();
      event.returnValue = g.beforeLeaveWarning;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [tasks.length, g.beforeLeaveWarning]);

  const onboardingSteps = useMemo(
    () => [
      { title: g.onboardingStep1Title, body: g.onboardingStep1Body },
      { title: g.onboardingStep2Title, body: g.onboardingStep2Body },
      { title: g.onboardingStep3Title, body: g.onboardingStep3Body },
    ],
    [g],
  );

  function closeOnboarding() {
    setShowOnboarding(false);
    setOnboardingStep(0);
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function addTask(title: string, timeBlock: TimeBlock) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title: trimmed,
        timeBlock,
      },
      ...current,
    ]);
  }

  function addManualTask(event: FormEvent) {
    event.preventDefault();
    addTask(manualTitle, manualTimeBlock);
    setManualTitle("");
  }

  function timeLabel(block: TimeBlock) {
    if (block === TIME_BLOCK.MORNING) return b.morning;
    if (block === TIME_BLOCK.AFTERNOON) return b.afternoon;
    return b.evening;
  }

  async function startFullGuestMode() {
    setStartingGuestMode(true);
    setStartError(null);
    try {
      const response = await fetch("/api/auth/guest-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.map((task) => ({ title: task.title, timeBlock: task.timeBlock })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStartError(payload.error ?? g.startError);
        return;
      }
      router.replace(payload.redirectTo ?? "/admin");
      router.refresh();
    } catch {
      setStartError(g.startError);
    } finally {
      setStartingGuestMode(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{g.title}</div>
        <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{g.subtitle}</p>
        <div style={{ marginTop: "0.75rem", padding: "0.65rem 0.75rem", borderRadius: 12, background: "rgba(255,149,0,0.12)", color: "#8a5608", fontSize: "0.9rem" }}>
          {showTimedReminder ? g.warningTimed : g.warning}
        </div>
        <div style={{ marginTop: "0.65rem", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" disabled={startingGuestMode} onClick={startFullGuestMode}>
            {startingGuestMode ? g.starting : g.startFullGuestMode}
          </button>
          <Link href="/admin/signup" className="btn btn-primary">{g.ctaSignup}</Link>
          <Link href="/try/board" className="btn btn-secondary">{g.openBoardPreview}</Link>
          <button type="button" className="btn btn-ghost" onClick={() => setShowTimedReminder(false)}>{g.ctaContinue}</button>
        </div>
        {startError ? <div style={{ marginTop: "0.55rem", color: "var(--danger)", fontSize: "0.9rem" }}>{startError}</div> : null}
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 700 }}>{g.quickAddTitle}</div>
        <div style={{ marginTop: "0.55rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          <button type="button" className={`admin-time-btn ${quickTimeBlock === TIME_BLOCK.MORNING ? "admin-time-btn-active" : ""}`} onClick={() => setQuickTimeBlock(TIME_BLOCK.MORNING)}>{b.morning}</button>
          <button type="button" className={`admin-time-btn ${quickTimeBlock === TIME_BLOCK.AFTERNOON ? "admin-time-btn-active" : ""}`} onClick={() => setQuickTimeBlock(TIME_BLOCK.AFTERNOON)}>{b.afternoon}</button>
          <button type="button" className={`admin-time-btn ${quickTimeBlock === TIME_BLOCK.EVENING ? "admin-time-btn-active" : ""}`} onClick={() => setQuickTimeBlock(TIME_BLOCK.EVENING)}>{b.evening}</button>
        </div>
        <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {presetKeys.map((key) => (
            <button key={key} type="button" className="admin-preset-chip" style={{ border: "none", borderRadius: 999, padding: "0.4rem 0.7rem", background: "rgba(0,122,255,0.08)", color: "#007aff", cursor: "pointer" }} onClick={() => addTask(a[key], quickTimeBlock)}>
              + {a[key]}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 700 }}>{g.manualAddTitle}</div>
        <form onSubmit={addManualTask} style={{ marginTop: "0.55rem", display: "grid", gap: "0.55rem" }}>
          <input className="input" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder={g.manualPlaceholder} />
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            <select className="select" value={manualTimeBlock} onChange={(event) => setManualTimeBlock(event.target.value as TimeBlock)} style={{ maxWidth: 220 }}>
              <option value={TIME_BLOCK.MORNING}>{b.morning}</option>
              <option value={TIME_BLOCK.AFTERNOON}>{b.afternoon}</option>
              <option value={TIME_BLOCK.EVENING}>{b.evening}</option>
            </select>
            <button type="submit" className="btn btn-primary">{g.addTask}</button>
          </div>
        </form>
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>{g.yourTasks} ({tasks.length})</div>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={tasks.length === 0}
            onClick={() => {
              if (window.confirm(g.clearConfirm)) setTasks([]);
            }}
          >
            {g.clearAll}
          </button>
        </div>
        <div style={{ marginTop: "0.7rem", display: "grid", gap: "0.5rem" }}>
          {tasks.length === 0 ? <div style={{ color: "var(--muted)" }}>{g.noTasks}</div> : null}
          {tasks.map((task) => (
            <div key={task.id} style={{ border: "1px solid var(--separator)", borderRadius: 12, padding: "0.6rem 0.7rem", display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{task.title}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{timeLabel(task.timeBlock)}</div>
              </div>
              <button type="button" className="btn btn-danger" style={{ padding: "0.3rem 0.55rem", fontSize: "0.8rem" }} onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}>
                {g.remove}
              </button>
            </div>
          ))}
        </div>
      </section>

      {showOnboarding ? (
        <div className="admin-onboard-overlay" onClick={closeOnboarding}>
          <div className="admin-onboard-modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontWeight: 700 }}>{g.onboardingTitle}</div>
              <button type="button" className="btn btn-ghost" style={{ padding: "0.35rem 0.55rem" }} onClick={closeOnboarding}>
                {g.skip}
              </button>
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              {a.onboardingStepLabel} {onboardingStep + 1}/3
            </div>
            <div style={{ marginTop: "0.5rem", fontWeight: 700, fontSize: "1rem" }}>{onboardingSteps[onboardingStep].title}</div>
            <div style={{ marginTop: "0.35rem", color: "var(--secondary)", lineHeight: 1.45 }}>{onboardingSteps[onboardingStep].body}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOnboardingStep((current) => Math.max(current - 1, 0))} disabled={onboardingStep === 0}>
                {g.back}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (onboardingStep === onboardingSteps.length - 1) {
                    closeOnboarding();
                    return;
                  }
                  setOnboardingStep((current) => Math.min(current + 1, onboardingSteps.length - 1));
                }}
              >
                {onboardingStep === onboardingSteps.length - 1 ? g.done : g.next}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
