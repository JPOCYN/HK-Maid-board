import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(24).optional(),
  SUPABASE_JWT_SECRET: z.string().min(24).optional(),
  DEFAULT_HOUSEHOLD_SLUG: z.string().min(1).default("home"),
});

const parsed = envSchema.safeParse({
  JWT_SECRET: process.env.JWT_SECRET,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  DEFAULT_HOUSEHOLD_SLUG: process.env.DEFAULT_HOUSEHOLD_SLUG ?? "home",
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")}`,
  );
}

const jwtSecret = (parsed.data.JWT_SECRET ?? parsed.data.SUPABASE_JWT_SECRET ?? "").trim();
if (jwtSecret.length < 24) {
  throw new Error("Invalid environment variables: JWT_SECRET (or SUPABASE_JWT_SECRET) is missing.");
}

export const env = {
  ...parsed.data,
  JWT_SECRET: jwtSecret,
};
