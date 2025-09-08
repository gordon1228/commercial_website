-- URGENT: Fix production Neon database
-- Run this in your PRODUCTION Neon Console (the one Vercel connects to)

-- Add missing mobileImages column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS "mobileImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Verify column was added
SELECT 
  column_name,
  data_type,
  column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
  AND column_name = 'mobileImages';

-- Update any NULL values to empty arrays
UPDATE vehicles 
SET "mobileImages" = ARRAY[]::TEXT[] 
WHERE "mobileImages" IS NULL;

SELECT 'Production database fixed - mobileImages column added!' as status;