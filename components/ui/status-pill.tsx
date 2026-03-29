import { TaskStatus } from "@/lib/task-constants";

const classes: Record<TaskStatus, string> = {
  PENDING: "pill pill-pending",
  COMPLETED: "pill pill-completed",
  SKIPPED: "pill pill-skipped",
};

const labels: Record<TaskStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Done",
  SKIPPED: "Skipped",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  return <span className={classes[status]}>{labels[status]}</span>;
}
