-- Verify Neon database schema for vehicles table
-- Run this in Neon Console to check column details

-- Check all columns in vehicles table
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- Specifically check mobileImages column
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
  AND column_name = 'mobileImages';

-- Check if there's a case sensitivity issue
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
  AND LOWER(column_name) LIKE '%mobile%';

-- Show table schema
\d vehicles;