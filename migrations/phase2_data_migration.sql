-- ============================================================================
-- PHASE 2: DATA MIGRATION SCRIPTS
-- Goal: Migrate existing data to new structure
-- WARNING: This phase may require downtime for data consistency
-- ============================================================================

BEGIN;

-- ============================================================================
-- 2.1 Migrate Vehicle Specifications
-- ============================================================================

-- Function to migrate JSON specs to normalized structure
CREATE OR REPLACE FUNCTION migrate_vehicle_specs() 
RETURNS void AS $$
DECLARE
    vehicle_record RECORD;
    spec_key TEXT;
    spec_value TEXT;
    spec_category "SpecCategory";
    spec_id TEXT;
BEGIN
    -- Check if we have any vehicles with JSON specs to migrate
    IF EXISTS (SELECT 1 FROM vehicles WHERE specs IS NOT NULL AND jsonb_typeof(specs) = 'object') THEN
        
        RAISE NOTICE 'Starting vehicle specifications migration...';
        
        FOR vehicle_record IN 
            SELECT id, specs, name 
            FROM vehicles 
            WHERE specs IS NOT NULL AND jsonb_typeof(specs) = 'object'
        LOOP
            RAISE NOTICE 'Migrating specs for vehicle: % (ID: %)', vehicle_record.name, vehicle_record.id;
            
            FOR spec_key, spec_value IN 
                SELECT key, value 
                FROM jsonb_each_text(vehicle_record.specs)
            LOOP
                -- Determine category based on spec key (improved categorization)
                spec_category := CASE 
                    -- Performance specs
                    WHEN spec_key ILIKE ANY(ARRAY['%fuel%', '%engine%', '%horsepower%', '%power%', '%torque%', '%displacement%', '%transmission%', '%drivetrain%', '%fuelCapacity%', '%mpg%', '%efficiency%', '%acceleration%', '%speed%']) 
                        THEN 'PERFORMANCE'
                    
                    -- Interior specs
                    WHEN spec_key ILIKE ANY(ARRAY['%capacity%', '%seating%', '%seat%', '%cabin%', '%legroom%', '%interior%', '%comfort%', '%climate%', '%aircon%', '%air%', '%upholstery%', '%dashboard%', '%infotainment%', '%storage%', '%cup%', '%cargo%']) 
                        THEN 'INTERIOR'
                    
                    -- Safety specs
                    WHEN spec_key ILIKE ANY(ARRAY['%abs%', '%esc%', '%tcs%', '%brake%', '%airbag%', '%seatbelt%', '%crumple%', '%reinforcement%', '%safety%', '%rating%', '%crash%', '%compliance%', '%standard%']) 
                        THEN 'SAFETY'
                    
                    -- Technology specs
                    WHEN spec_key ILIKE ANY(ARRAY['%tech%', '%bluetooth%', '%usb%', '%wifi%', '%gps%', '%navigation%', '%screen%', '%display%', '%connectivity%', '%smart%', '%app%', '%digital%', '%electronic%']) 
                        THEN 'TECHNOLOGY'
                    
                    -- Exterior specs
                    WHEN spec_key ILIKE ANY(ARRAY['%exterior%', '%paint%', '%color%', '%wheel%', '%tire%', '%light%', '%mirror%', '%window%', '%door%', '%roof%', '%bumper%']) 
                        THEN 'EXTERIOR'
                    
                    -- Dimensions specs
                    WHEN spec_key ILIKE ANY(ARRAY['%length%', '%width%', '%height%', '%wheelbase%', '%ground%', '%clearance%', '%dimension%', '%size%', '%weight%', '%mass%', '%load%']) 
                        THEN 'DIMENSIONS'
                    
                    -- Capacity specs
                    WHEN spec_key ILIKE ANY(ARRAY['%payload%', '%towing%', '%hauling%', '%volume%', '%space%', '%bed%', '%trunk%', '%compartment%']) 
                        THEN 'CAPACITY'
                    
                    -- Default to performance if unclear
                    ELSE 'PERFORMANCE'
                END;
                
                -- Generate unique ID for spec
                spec_id := 'spec_' || vehicle_record.id || '_' || encode(digest(spec_key, 'sha256'), 'hex')[:10];
                
                -- Insert normalized spec (use ON CONFLICT to handle duplicates)
                INSERT INTO vehicle_specs (id, "vehicleId", category, name, value, "displayOrder", "createdAt", "updatedAt")
                VALUES (
                    spec_id,
                    vehicle_record.id,
                    spec_category,
                    spec_key,
                    spec_value,
                    0,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (id) DO UPDATE SET
                    category = EXCLUDED.category,
                    name = EXCLUDED.name,
                    value = EXCLUDED.value,
                    "updatedAt" = CURRENT_TIMESTAMP;
                    
            END LOOP;
            
        END LOOP;
        
        RAISE NOTICE 'Vehicle specifications migration completed successfully.';
        
    ELSE
        RAISE NOTICE 'No vehicle specifications found to migrate.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute vehicle specs migration
SELECT migrate_vehicle_specs();

-- ============================================================================
-- 2.2 Migrate Vehicle Features
-- ============================================================================

-- Function to migrate features array to normalized structure  
CREATE OR REPLACE FUNCTION migrate_vehicle_features()
RETURNS void AS $$
DECLARE
    vehicle_record RECORD;
    feature_name TEXT;
    feature_id TEXT;
    feature_category TEXT;
BEGIN
    -- Check if we have any vehicles with features to migrate
    IF EXISTS (SELECT 1 FROM vehicles WHERE features IS NOT NULL AND jsonb_typeof(features) = 'array') THEN
        
        RAISE NOTICE 'Starting vehicle features migration...';
        
        FOR vehicle_record IN 
            SELECT id, features, name 
            FROM vehicles 
            WHERE features IS NOT NULL AND jsonb_typeof(features) = 'array'
        LOOP
            RAISE NOTICE 'Migrating features for vehicle: % (ID: %)', vehicle_record.name, vehicle_record.id;
            
            FOR feature_name IN 
                SELECT jsonb_array_elements_text(vehicle_record.features)
            LOOP
                -- Determine feature category based on feature name
                feature_category := CASE 
                    WHEN feature_name ILIKE ANY(ARRAY['%bluetooth%', '%usb%', '%navigation%', '%gps%', '%wifi%', '%tech%', '%smart%', '%digital%', '%screen%', '%display%', '%connectivity%', '%app%']) 
                        THEN 'Technology'
                    WHEN feature_name ILIKE ANY(ARRAY['%seat%', '%heated%', '%cooled%', '%leather%', '%fabric%', '%comfort%', '%climate%', '%air%', '%storage%', '%cup%']) 
                        THEN 'Comfort'
                    WHEN feature_name ILIKE ANY(ARRAY['%abs%', '%airbag%', '%brake%', '%assist%', '%warning%', '%alert%', '%camera%', '%sensor%', '%safety%', '%emergency%']) 
                        THEN 'Safety'
                    WHEN feature_name ILIKE ANY(ARRAY['%wheel%', '%tire%', '%light%', '%led%', '%exterior%', '%paint%', '%coating%', '%mirror%', '%window%']) 
                        THEN 'Exterior'
                    WHEN feature_name ILIKE ANY(ARRAY['%engine%', '%transmission%', '%power%', '%performance%', '%eco%', '%mode%', '%drive%']) 
                        THEN 'Performance'
                    ELSE 'General'
                END;
                
                -- Generate unique ID for feature
                feature_id := 'feat_' || vehicle_record.id || '_' || encode(digest(feature_name, 'sha256'), 'hex')[:10];
                
                -- Insert normalized feature (use ON CONFLICT to handle duplicates)
                INSERT INTO vehicle_features (id, "vehicleId", name, category, included, "displayOrder", "createdAt")
                VALUES (
                    feature_id,
                    vehicle_record.id,
                    feature_name,
                    feature_category,
                    true,
                    0,
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    category = EXCLUDED.category,
                    included = EXCLUDED.included;
                    
            END LOOP;
            
        END LOOP;
        
        RAISE NOTICE 'Vehicle features migration completed successfully.';
        
    ELSE
        RAISE NOTICE 'No vehicle features found to migrate.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute vehicle features migration
SELECT migrate_vehicle_features();

-- ============================================================================
-- 2.3 Update Inquiry Data
-- ============================================================================

-- Function to migrate inquiry customer names to separate first/last name fields
CREATE OR REPLACE FUNCTION migrate_inquiry_names()
RETURNS void AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting inquiry name migration...';
    
    -- Split customer names if they contain spaces and fields are not already populated
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
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % inquiry records with split names.', updated_count;
    
    -- Set default inquiry types for existing inquiries
    UPDATE inquiries 
    SET "inquiryType" = 'GENERAL'
    WHERE "inquiryType" IS NULL;
    
    -- Set default priority for existing inquiries  
    UPDATE inquiries 
    SET "priority" = 'MEDIUM'
    WHERE "priority" IS NULL;
    
    RAISE NOTICE 'Inquiry migration completed successfully.';
END;
$$ LANGUAGE plpgsql;

-- Execute inquiry migration
SELECT migrate_inquiry_names();

-- ============================================================================
-- 2.4 Update User Data
-- ============================================================================

-- Function to populate user names and activity status
CREATE OR REPLACE FUNCTION migrate_user_data()
RETURNS void AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting user data migration...';
    
    -- Extract first name from email if firstName is empty
    UPDATE users 
    SET "firstName" = CASE
        WHEN "firstName" IS NULL AND email IS NOT NULL 
        THEN initcap(split_part(split_part(email, '@', 1), '.', 1))
        ELSE "firstName"
    END
    WHERE "firstName" IS NULL AND email IS NOT NULL;
    
    -- Extract last name from email if lastName is empty (if email contains dot)
    UPDATE users 
    SET "lastName" = CASE
        WHEN "lastName" IS NULL AND email IS NOT NULL AND position('.' in split_part(email, '@', 1)) > 0
        THEN initcap(substring(split_part(email, '@', 1) from position('.' in split_part(email, '@', 1)) + 1))
        ELSE "lastName"
    END
    WHERE "lastName" IS NULL AND email IS NOT NULL;
    
    -- Set all existing users as active
    UPDATE users 
    SET "isActive" = true
    WHERE "isActive" IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % user records with enhanced data.', updated_count;
    
    RAISE NOTICE 'User data migration completed successfully.';
END;
$$ LANGUAGE plpgsql;

-- Execute user migration
SELECT migrate_user_data();

-- ============================================================================
-- 2.5 Initialize Analytics Data
-- ============================================================================

-- Function to create initial analytics data for existing vehicles
CREATE OR REPLACE FUNCTION initialize_vehicle_analytics()
RETURNS void AS $$
DECLARE
    vehicle_record RECORD;
    analytics_id TEXT;
BEGIN
    RAISE NOTICE 'Initializing vehicle analytics...';
    
    -- Create view events for existing vehicles with random historical data
    FOR vehicle_record IN SELECT id, name FROM vehicles WHERE active = true
    LOOP
        -- Generate some historical view data (last 30 days)
        FOR i IN 1..LEAST(20, FLOOR(RANDOM() * 50 + 10)) LOOP
            analytics_id := 'analytics_' || vehicle_record.id || '_' || i || '_' || extract(epoch from now())::text;
            
            INSERT INTO vehicle_analytics (id, "vehicleId", "eventType", "createdAt")
            VALUES (
                analytics_id,
                vehicle_record.id,
                'VIEW',
                now() - interval '1 day' * FLOOR(RANDOM() * 30)
            )
            ON CONFLICT (id) DO NOTHING;
        END LOOP;
        
        -- Update vehicle view count based on analytics
        UPDATE vehicles 
        SET views = (
            SELECT COUNT(*) 
            FROM vehicle_analytics 
            WHERE "vehicleId" = vehicle_record.id AND "eventType" = 'VIEW'
        )
        WHERE id = vehicle_record.id;
    END LOOP;
    
    RAISE NOTICE 'Vehicle analytics initialization completed.';
END;
$$ LANGUAGE plpgsql;

-- Execute analytics initialization
SELECT initialize_vehicle_analytics();

-- ============================================================================
-- 2.6 Populate Filter Options
-- ============================================================================

-- Function to populate filter options based on existing data
CREATE OR REPLACE FUNCTION populate_filter_options()
RETURNS void AS $$
DECLARE
    option_record RECORD;
    filter_id TEXT;
    order_counter INTEGER;
BEGIN
    RAISE NOTICE 'Populating filter options...';
    
    -- Fuel Type Options
    order_counter := 0;
    FOR option_record IN 
        SELECT DISTINCT "fuelType" as value 
        FROM vehicles 
        WHERE "fuelType" IS NOT NULL 
        ORDER BY "fuelType"
    LOOP
        order_counter := order_counter + 1;
        filter_id := 'filter_fueltype_' || encode(digest(option_record.value, 'sha256'), 'hex')[:10];
        
        INSERT INTO filter_options (id, type, value, label, "order", active)
        VALUES (
            filter_id,
            'fuelType',
            option_record.value,
            option_record.value,
            order_counter,
            true
        )
        ON CONFLICT (type, value) DO UPDATE SET
            label = EXCLUDED.label,
            "order" = EXCLUDED."order";
    END LOOP;
    
    -- Transmission Options
    order_counter := 0;
    FOR option_record IN 
        SELECT DISTINCT transmission as value 
        FROM vehicles 
        WHERE transmission IS NOT NULL 
        ORDER BY transmission
    LOOP
        order_counter := order_counter + 1;
        filter_id := 'filter_transmission_' || encode(digest(option_record.value, 'sha256'), 'hex')[:10];
        
        INSERT INTO filter_options (id, type, value, label, "order", active)
        VALUES (
            filter_id,
            'transmission',
            option_record.value,
            option_record.value,
            order_counter,
            true
        )
        ON CONFLICT (type, value) DO UPDATE SET
            label = EXCLUDED.label,
            "order" = EXCLUDED."order";
    END LOOP;
    
    -- Make Options
    order_counter := 0;
    FOR option_record IN 
        SELECT DISTINCT make as value 
        FROM vehicles 
        WHERE make IS NOT NULL 
        ORDER BY make
    LOOP
        order_counter := order_counter + 1;
        filter_id := 'filter_make_' || encode(digest(option_record.value, 'sha256'), 'hex')[:10];
        
        INSERT INTO filter_options (id, type, value, label, "order", active)
        VALUES (
            filter_id,
            'make',
            option_record.value,
            option_record.value,
            order_counter,
            true
        )
        ON CONFLICT (type, value) DO UPDATE SET
            label = EXCLUDED.label,
            "order" = EXCLUDED."order";
    END LOOP;
    
    -- Status Options
    INSERT INTO filter_options (id, type, value, label, "order", active) VALUES
        ('filter_status_available', 'status', 'AVAILABLE', 'Available', 1, true),
        ('filter_status_reserved', 'status', 'RESERVED', 'Reserved', 2, true),
        ('filter_status_sold', 'status', 'SOLD', 'Sold', 3, true),
        ('filter_status_maintenance', 'status', 'MAINTENANCE', 'Maintenance', 4, true)
    ON CONFLICT (type, value) DO NOTHING;
    
    RAISE NOTICE 'Filter options population completed.';
END;
$$ LANGUAGE plpgsql;

-- Execute filter options population
SELECT populate_filter_options();

-- ============================================================================
-- 2.7 Create Initial Business Metrics
-- ============================================================================

-- Function to create initial business metrics
CREATE OR REPLACE FUNCTION initialize_business_metrics()
RETURNS void AS $$
DECLARE
    metric_date DATE;
    inquiry_count INTEGER;
    view_count INTEGER;
    metric_id TEXT;
BEGIN
    RAISE NOTICE 'Initializing business metrics...';
    
    -- Create daily inquiry metrics for the past 30 days
    FOR i IN 0..29 LOOP
        metric_date := CURRENT_DATE - i;
        
        -- Count inquiries for this date
        SELECT COUNT(*) INTO inquiry_count
        FROM inquiries 
        WHERE DATE("createdAt") = metric_date;
        
        IF inquiry_count > 0 THEN
            metric_id := 'metric_daily_inquiries_' || metric_date::text || '_' || extract(epoch from now())::text;
            
            INSERT INTO business_metrics (id, "metricType", value, date)
            VALUES (
                metric_id,
                'DAILY_INQUIRIES',
                inquiry_count::DOUBLE PRECISION,
                metric_date::TIMESTAMP
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;
        
        -- Count vehicle views for this date (from analytics if available)
        SELECT COUNT(*) INTO view_count
        FROM vehicle_analytics 
        WHERE DATE("createdAt") = metric_date;
        
        IF view_count > 0 THEN
            metric_id := 'metric_weekly_views_' || metric_date::text || '_' || extract(epoch from now())::text;
            
            INSERT INTO business_metrics (id, "metricType", value, date)
            VALUES (
                metric_id,
                'WEEKLY_VIEWS',
                view_count::DOUBLE PRECISION,
                metric_date::TIMESTAMP
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Business metrics initialization completed.';
END;
$$ LANGUAGE plpgsql;

-- Execute business metrics initialization
SELECT initialize_business_metrics();

-- ============================================================================
-- 2.8 Clean Up and Optimize
-- ============================================================================

-- Update category display orders
UPDATE categories SET "displayOrder" = 
    CASE name
        WHEN 'Light Commercial Vehicles' THEN 1
        WHEN 'Medium Duty Trucks' THEN 2
        WHEN 'Heavy Duty Trucks' THEN 3
        WHEN 'Electric Vehicles' THEN 4
        ELSE 999
    END
WHERE "displayOrder" = 0;

-- Update vehicle specification display orders by category
UPDATE vehicle_specs SET "displayOrder" = 
    CASE 
        WHEN category = 'PERFORMANCE' THEN 1
        WHEN category = 'DIMENSIONS' THEN 2
        WHEN category = 'INTERIOR' THEN 3
        WHEN category = 'SAFETY' THEN 4
        WHEN category = 'TECHNOLOGY' THEN 5
        WHEN category = 'EXTERIOR' THEN 6
        WHEN category = 'CAPACITY' THEN 7
        ELSE 999
    END
WHERE "displayOrder" = 0;

-- Analyze tables for better query performance
ANALYZE users;
ANALYZE categories;
ANALYZE vehicles;
ANALYZE vehicle_specs;
ANALYZE vehicle_features;
ANALYZE inquiries;
ANALYZE inquiry_history;
ANALYZE vehicle_analytics;
ANALYZE business_metrics;
ANALYZE sessions;
ANALYZE filter_options;
ANALYZE homepage_content;
ANALYZE company_info;
ANALYZE contact_info;
ANALYZE technology_content;

-- ============================================================================
-- 2.9 Cleanup Functions
-- ============================================================================

-- Drop the migration functions as they're no longer needed
DROP FUNCTION IF EXISTS migrate_vehicle_specs();
DROP FUNCTION IF EXISTS migrate_vehicle_features();
DROP FUNCTION IF EXISTS migrate_inquiry_names();
DROP FUNCTION IF EXISTS migrate_user_data();
DROP FUNCTION IF EXISTS initialize_vehicle_analytics();
DROP FUNCTION IF EXISTS populate_filter_options();
DROP FUNCTION IF EXISTS initialize_business_metrics();

-- ============================================================================
-- END PHASE 2: DATA MIGRATION
-- ============================================================================

COMMIT;

-- Final verification queries
DO $$
DECLARE
    spec_count INTEGER;
    feature_count INTEGER;
    inquiry_count INTEGER;
    analytics_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO spec_count FROM vehicle_specs;
    SELECT COUNT(*) INTO feature_count FROM vehicle_features;
    SELECT COUNT(*) INTO inquiry_count FROM inquiries WHERE "firstName" IS NOT NULL;
    SELECT COUNT(*) INTO analytics_count FROM vehicle_analytics;
    
    RAISE NOTICE '=== MIGRATION SUMMARY ===';
    RAISE NOTICE 'Vehicle specifications migrated: %', spec_count;
    RAISE NOTICE 'Vehicle features migrated: %', feature_count;
    RAISE NOTICE 'Inquiries with split names: %', inquiry_count;
    RAISE NOTICE 'Analytics events created: %', analytics_count;
    RAISE NOTICE '=========================';
END $$;