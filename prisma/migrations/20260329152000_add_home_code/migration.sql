ALTER TABLE "Household"
ADD COLUMN "homeCode" TEXT;

DO $$
DECLARE
  row_record RECORD;
  generated_code TEXT;
  letters TEXT;
  digits TEXT;
BEGIN
  FOR row_record IN
    SELECT "id"
    FROM "Household"
    WHERE "homeCode" IS NULL
  LOOP
    LOOP
      letters :=
        chr(65 + floor(random() * 26)::int) ||
        chr(65 + floor(random() * 26)::int) ||
        chr(65 + floor(random() * 26)::int);
      digits := lpad(floor(random() * 1000)::int::text, 3, '0');
      generated_code := letters || '-' || digits;

      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM "Household"
        WHERE "homeCode" = generated_code
      );
    END LOOP;

    UPDATE "Household"
    SET "homeCode" = generated_code
    WHERE "id" = row_record."id";
  END LOOP;
END $$;

ALTER TABLE "Household"
ALTER COLUMN "homeCode" SET NOT NULL;

CREATE UNIQUE INDEX "Household_homeCode_key" ON "Household"("homeCode");
