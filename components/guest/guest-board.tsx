"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/i18n/context";
import { TASK_STATUS, TaskStatus, TIME_BLOCK, TimeBlock } from "@/lib/task-constants";

type GuestTask = {
  id: string;
  title: string;
  timeBlock: TimeBlock;
};

type GuestBoardTask = GuestTask & { status: TaskStatus };

const STORAGE_KEY = "maidboard_guest_tasks";
const BLOCKS = [TIME_BLOCK.MORNING, TIME_BLOCK.AFTERNOON, TIME_BLOCK.EVENING] as const;

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

export function GuestBoard() {
  const { t } = useTranslation();
  const b = t.board;
  const g = t.guest;

  const [tasks, setTasks] = useState<GuestBoardTask[]>(
    () => readGuestTasks().map((task) => ({ ...task, status: TASK_STATUS.PENDING })),
  );

  const grouped = useMemo(
    () => ({
      [TIME_BLOCK.MORNING]: tasks.filter((task) => task.timeBlock === TIME_BLOCK.MORNING),
      [TIME_BLOCK.AFTERNOON]: tasks.filter((task) => task.timeBlock === TIME_BLOCK.AFTERNOON),
      [TIME_BLOCK.EVENING]: tasks.filter((task) => task.timeBlock === TIME_BLOCK.EVENING),
    }),
    [tasks],
  );

  function blockLabel(block: TimeBlock) {
    if (block === TIME_BLOCK.MORNING) return b.morning;
    if (block === TIME_BLOCK.AFTERNOON) return b.afternoon;
    return b.evening;
  }

  function setStatus(id: string, status: TaskStatus) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  return (
    <main className="board">
      <header className="board-header">
        <div className="board-header-left">
          <div className="board-greeting">{g.boardPreviewTitle}</div>
          <Link href="/try" className="board-exit-btn">
            {"\u2190"} {g.backToGuest}
          </Link>
        </div>
        <div className="board-header-center" />
        <div className="board-header-right">
          <LanguageSwitcher compact />
        </div>
      </header>

      <div className="board-content">
        {tasks.length === 0 ? (
          <div className="board-empty">
            <div className="board-empty-icon">{"\uD83D\uDCCB"}</div>
            <div className="board-empty-text">{g.boardEmpty}</div>
          </div>
        ) : (
          <div className="board-columns">
            {BLOCKS.map((block) => (
              <section key={block} className="block-column">
                <div className="block-header">
                  <div className="block-title">{blockLabel(block)}</div>
                  <div className="block-count">{grouped[block].filter((task) => task.status !== TASK_STATUS.PENDING).length}/{grouped[block].length}</div>
                </div>
                {grouped[block].map((task) => (
                  <div key={task.id} className={`task-card ${task.status === TASK_STATUS.COMPLETED ? "task-card-done" : task.status === TASK_STATUS.SKIPPED ? "task-card-skipped" : ""}`}>
                    <div className="task-top-row">
                      <div className="task-title">{task.title}</div>
                    </div>
                    <div className="task-actions">
                      {task.status === TASK_STATUS.PENDING ? (
                        <>
                          <button className="task-btn task-btn-complete" onClick={() => setStatus(task.id, TASK_STATUS.COMPLETED)}>{b.complete}</button>
                          <button className="task-btn task-btn-skip" onClick={() => setStatus(task.id, TASK_STATUS.SKIPPED)}>{b.skip}</button>
                        </>
                      ) : (
                        <button className="task-btn task-btn-undo" onClick={() => setStatus(task.id, TASK_STATUS.PENDING)}>{b.undo}</button>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
