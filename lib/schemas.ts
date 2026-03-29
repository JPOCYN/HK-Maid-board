import { FrequencyType, TaskStatus, TimeBlock } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(100),
  householdName: z.string().trim().min(1).max(100),
});

export const taskTemplateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional().nullable(),
  timeBlock: z.enum(TimeBlock),
  frequencyType: z.enum(FrequencyType),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  isActive: z.boolean().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TaskStatus),
});
