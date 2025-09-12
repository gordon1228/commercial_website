-- ============================================================================
-- PHASE 2: SIMPLE DATA MIGRATION (Prisma Compatible)
-- Goal: Migrate existing data to new structure
-- ============================================================================

-- 2.1 Update Inquiry Data - Split customer names
UPDATE inquiries 
SET 
    "firstName" = CASE 
        WHEN "customerName" IS NOT NULL AND position(' ' in "customerName") > 0 
        THEN substring("customerName" from 1 for position(' ' in "customerName") - 1)
        WHEN "customerName" IS NOT NULL
        THEN "customerName"
        ELSE NULL
    END,
    "lastName" = CASE 
        WHEN "customerName" IS NOT NULL AND position(' ' in "customerName") > 0 
        THEN substring("customerName" from position(' ' in "customerName") + 1)
        ELSE NULL
    END
WHERE ("firstName" IS NULL OR "lastName" IS NULL) 
  AND "customerName" IS NOT NULL;

-- Set default inquiry types and priorities for existing inquiries
UPDATE inquiries 
SET "inquiryType" = 'GENERAL'
WHERE "inquiryType" IS NULL;

UPDATE inquiries 
SET "priority" = 'MEDIUM'
WHERE "priority" IS NULL;

-- 2.2 Update User Data
-- Set all existing users as active
UPDATE users 
SET "isActive" = true
WHERE "isActive" IS NULL;

-- 2.3 Update Category Display Orders
UPDATE categories 
SET "displayOrder" = 
    CASE name
        WHEN 'Light Commercial Vehicles' THEN 1
        WHEN 'Medium Duty Trucks' THEN 2
        WHEN 'Heavy Duty Trucks' THEN 3
        WHEN 'Electric Vehicles' THEN 4
        ELSE 999
    END
WHERE "displayOrder" = 0 OR "displayOrder" IS NULL;

-- 2.4 Initialize Vehicle Views
UPDATE vehicles 
SET views = 0
WHERE views IS NULL;

-- 2.5 Create Initial Business Metrics (Simple approach)
INSERT INTO business_metrics (id, "metricType", value, date, "createdAt")
SELECT 
    'metric_daily_inquiries_' || CURRENT_DATE || '_init',
    'DAILY_INQUIRIES',
    COUNT(*) * 1.0,
    CURRENT_DATE,
    CURRENT_TIMESTAMP
FROM inquiries 
WHERE DATE("createdAt") = CURRENT_DATE
HAVING COUNT(*) > 0;

-- 2.6 Populate Filter Options Based on Existing Data
-- Fuel Type Options
INSERT INTO filter_options (id, type, value, label, "order", active, created_at, updated_at)
SELECT DISTINCT
    'filter_fueltype_' || lower(replace("fuelType", ' ', '_')),
    'fuelType',
    "fuelType",
    "fuelType",
    ROW_NUMBER() OVER (ORDER BY "fuelType"),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM vehicles 
WHERE "fuelType" IS NOT NULL
ON CONFLICT (type, value) DO NOTHING;

-- Transmission Options
INSERT INTO filter_options (id, type, value, label, "order", active, created_at, updated_at)
SELECT DISTINCT
    'filter_transmission_' || lower(replace(transmission, ' ', '_')),
    'transmission',
    transmission,
    transmission,
    ROW_NUMBER() OVER (ORDER BY transmission),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM vehicles 
WHERE transmission IS NOT NULL
ON CONFLICT (type, value) DO NOTHING;

-- Make Options
INSERT INTO filter_options (id, type, value, label, "order", active, created_at, updated_at)
SELECT DISTINCT
    'filter_make_' || lower(replace(make, ' ', '_')),
    'make',
    make,
    make,
    ROW_NUMBER() OVER (ORDER BY make),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM vehicles 
WHERE make IS NOT NULL
ON CONFLICT (type, value) DO NOTHING;

-- Status Options
INSERT INTO filter_options (id, type, value, label, "order", active, created_at, updated_at)
VALUES
    ('filter_status_available', 'status', 'AVAILABLE', 'Available', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('filter_status_reserved', 'status', 'RESERVED', 'Reserved', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('filter_status_sold', 'status', 'SOLD', 'Sold', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (type, value) DO NOTHING;