import { TaskStatus } from "@/lib/task-constants";

const labels: Record<TaskStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

const classes: Record<TaskStatus, string> = {
  PENDING: "pill pill-pending",
  COMPLETED: "pill pill-completed",
  SKIPPED: "pill pill-skipped",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  return <span className={classes[status]}>{labels[status]}</span>;
}
