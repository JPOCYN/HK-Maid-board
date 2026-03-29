ALTER TABLE "Household"
ADD COLUMN "boardToken" TEXT;

UPDATE "Household"
SET "boardToken" = md5(id || random()::text || clock_timestamp()::text)
WHERE "boardToken" IS NULL;

ALTER TABLE "Household"
ALTER COLUMN "boardToken" SET NOT NULL;

CREATE UNIQUE INDEX "Household_boardToken_key" ON "Household"("boardToken");
