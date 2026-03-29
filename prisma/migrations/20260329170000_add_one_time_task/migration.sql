DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'FrequencyType' AND e.enumlabel = 'ONCE'
  ) THEN
    ALTER TYPE "FrequencyType" ADD VALUE 'ONCE';
  END IF;
END $$;

ALTER TABLE "TaskTemplate"
ADD COLUMN IF NOT EXISTS "oneTimeDate" TIMESTAMP(3);
