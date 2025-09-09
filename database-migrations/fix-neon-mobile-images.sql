-- Fix for Neon Database: Add missing mobileImages column
-- Run this in Neon Console SQL Editor or via psql

-- Add the missing mobileImages column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS "mobileImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update any existing NULL values to empty arrays
UPDATE vehicles 
SET "mobileImages" = ARRAY[]::TEXT[] 
WHERE "mobileImages" IS NULL;

-- Verify column exists and has correct type
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
  AND column_name = 'mobileImages';

-- Show success message
SELECT 'Mobile images column successfully added to Neon database!' as result;