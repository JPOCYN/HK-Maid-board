export const TASK_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TIME_BLOCK = {
  MORNING: "MORNING",
  AFTERNOON: "AFTERNOON",
  EVENING: "EVENING",
} as const;

export type TimeBlock = (typeof TIME_BLOCK)[keyof typeof TIME_BLOCK];

export const FREQUENCY_TYPE = {
  DAILY: "DAILY",
  WEEKDAYS: "WEEKDAYS",
  ONCE: "ONCE",
} as const;

export type FrequencyType = (typeof FREQUENCY_TYPE)[keyof typeof FREQUENCY_TYPE];
