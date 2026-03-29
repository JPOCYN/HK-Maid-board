-- Create missing PostgreSQL enum types for Prisma models.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TimeBlock') THEN
    CREATE TYPE "TimeBlock" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FrequencyType') THEN
    CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'WEEKDAYS');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
    CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');
  END IF;
END $$;

-- Convert existing text columns to enums.
ALTER TABLE "TaskTemplate"
  ALTER COLUMN "timeBlock" TYPE "TimeBlock" USING ("timeBlock"::text::"TimeBlock"),
  ALTER COLUMN "frequencyType" TYPE "FrequencyType" USING ("frequencyType"::text::"FrequencyType");

ALTER TABLE "DailyTask"
  ALTER COLUMN "timeBlock" TYPE "TimeBlock" USING ("timeBlock"::text::"TimeBlock"),
  ALTER COLUMN "status" TYPE "TaskStatus" USING ("status"::text::"TaskStatus");

-- Re-assert default using enum type.
ALTER TABLE "DailyTask"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"TaskStatus";
