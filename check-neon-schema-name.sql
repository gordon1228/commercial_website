-- Check schema naming in Neon database
-- Sometimes the issue is public schema vs default schema

-- Check which schema the vehicles table is in
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'vehicles'
  AND column_name = 'mobileImages';

-- List all schemas
SELECT schema_name 
FROM information_schema.schemata;

-- Check if table exists in public schema specifically
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'vehicles'
) AS table_exists_in_public;