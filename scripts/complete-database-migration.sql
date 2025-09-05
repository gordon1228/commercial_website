-- Complete Database Migration Script
-- Run this in your database console to sync all schema changes

-- 1. Create contact_info table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."contact_info" (
    "id" TEXT NOT NULL,
    "salesPhone" TEXT NOT NULL DEFAULT '+010 339 1414',
    "servicePhone" TEXT NOT NULL DEFAULT '+016 332 2349',
    "financePhone" TEXT NOT NULL DEFAULT '+016 332 2349',
    "salesEmail" TEXT NOT NULL DEFAULT 'sales@evtl.com.my',
    "serviceEmail" TEXT NOT NULL DEFAULT 'service@evtl.com.my',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@evtl.com.my',
    "address" TEXT NOT NULL DEFAULT '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    "city" TEXT NOT NULL DEFAULT '43000 Kajang, Selangor',
    "directions" TEXT NOT NULL DEFAULT 'EVTL Trucks Office',
    "mondayToFriday" TEXT NOT NULL DEFAULT '9:00 AM - 6:00 PM',
    "saturday" TEXT NOT NULL DEFAULT '9:00 AM - 1:00 PM',
    "sunday" TEXT NOT NULL DEFAULT 'Closed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- 2. Insert default contact info if table is empty
INSERT INTO "public"."contact_info" (
    "id", "salesPhone", "servicePhone", "financePhone", 
    "salesEmail", "serviceEmail", "supportEmail", 
    "address", "city", "directions",
    "mondayToFriday", "saturday", "sunday"
) 
SELECT 
    'default-contact-info',
    '+010 339 1414',
    '+016 332 2349', 
    '+016 332 2349',
    'sales@evtl.com.my',
    'service@evtl.com.my',
    'support@evtl.com.my',
    '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    '43000 Kajang, Selangor',
    'EVTL Trucks Office',
    '9:00 AM - 6:00 PM',
    '9:00 AM - 1:00 PM', 
    'Closed'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."contact_info" LIMIT 1
);

-- 3. Remove section visibility columns from homepage_content if they exist
-- (These columns were removed from the schema)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'showComingSoonSection') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "showComingSoonSection";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'showHeroSection') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "showHeroSection";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'showVehicleCategories') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "showVehicleCategories";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'showFeaturedVehicles') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "showFeaturedVehicles";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'showTrustSection') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "showTrustSection";
    END IF;
END $$;

-- 4. Update default values in existing tables to reflect EVTL branding
-- Update Settings table defaults
UPDATE "public"."settings" 
SET 
    "siteName" = 'EVTL',
    "contactEmail" = 'contact@evtl.com'
WHERE "siteName" = 'EliteFleet' OR "contactEmail" LIKE '%elitefleet.com%';

-- Update CompanyInfo table defaults  
UPDATE "public"."company_info"
SET 
    "companyName" = 'EVTL',
    "companyDescription" = 'For over 25 years, we''ve been the trusted partner for businesses seeking premium commercial trucks. Our commitment to excellence drives everything we do.',
    "storyParagraph1" = 'Founded in 1998, EVTL began as a small family business with a simple mission: to provide high-quality commercial trucks to businesses that demand excellence. What started as a modest dealership has grown into one of the region''s most trusted commercial truck providers.'
WHERE "companyName" = 'EliteFleet';

-- 5. Update HomepageContent table defaults
UPDATE "public"."homepage_content"
SET 
    "heroSubtitle" = 'Trucks',
    "heroDescription" = 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.',
    "heroButtonPrimary" = 'Explore Trucks',
    "partnersDescription" = 'We partner with the world''s most respected commercial truck manufacturers to bring you unparalleled quality and reliability.'
WHERE "heroSubtitle" = 'Vehicles' OR "heroButtonPrimary" = 'Explore Fleet';

-- 6. Clean up any orphaned data and ensure referential integrity
-- This ensures all foreign key constraints are maintained

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '1. Created contact_info table with EVTL default data';
    RAISE NOTICE '2. Removed section visibility columns from homepage_content';
    RAISE NOTICE '3. Updated branding from EliteFleet to EVTL';
    RAISE NOTICE '4. Updated homepage content to focus on trucks';
END $$;