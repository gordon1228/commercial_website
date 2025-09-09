-- Fix missing mobileImages column
-- Run this in your Supabase SQL Editor or PostgreSQL database

-- Add the missing mobileImages column to vehicles table
ALTER TABLE "public"."vehicles" 
ADD COLUMN IF NOT EXISTS "mobileImages" TEXT[] DEFAULT '{}';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND table_schema = 'public' 
AND column_name = 'mobileImages';

-- Show success message
SELECT 'mobileImages column added successfully!' as message;