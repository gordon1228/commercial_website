-- Add transmission field to vehicles table
ALTER TABLE "vehicles" ADD COLUMN "transmission" TEXT;

-- Optionally, set default values for existing records
-- UPDATE "vehicles" SET "transmission" = 'Automatic' WHERE "transmission" IS NULL;