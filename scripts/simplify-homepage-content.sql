-- Simplify Homepage Content Table
-- This script removes all unnecessary columns from homepage_content table
-- keeping only the essential hero section fields

-- Remove unnecessary columns from homepage_content table
DO $$ 
BEGIN
    -- Remove statistics columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'vehiclesSold') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "vehiclesSold";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'trucksSold') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "trucksSold";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'happyClients') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "happyClients";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'yearsExperience') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "yearsExperience";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'satisfactionRate') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "satisfactionRate";
    END IF;

    -- Remove partners section columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'partnersTitle') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "partnersTitle";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'partnersDescription') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "partnersDescription";
    END IF;

    -- Remove trust features columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature1Title') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature1Title";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature1Description') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature1Description";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature2Title') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature2Title";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature2Description') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature2Description";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature3Title') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature3Title";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'feature3Description') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "feature3Description";
    END IF;

    -- Remove coming soon section columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'comingSoonImage') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "comingSoonImage";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'comingSoonImageAlt') THEN
        ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "comingSoonImageAlt";
    END IF;

    -- Ensure essential columns exist with proper defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'heroTitle') THEN
        ALTER TABLE "public"."homepage_content" ADD COLUMN "heroTitle" TEXT DEFAULT 'Premium Commercial';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'heroSubtitle') THEN
        ALTER TABLE "public"."homepage_content" ADD COLUMN "heroSubtitle" TEXT DEFAULT 'Trucks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'heroDescription') THEN
        ALTER TABLE "public"."homepage_content" ADD COLUMN "heroDescription" TEXT DEFAULT 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'heroButtonPrimary') THEN
        ALTER TABLE "public"."homepage_content" ADD COLUMN "heroButtonPrimary" TEXT DEFAULT 'Explore Trucks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'heroButtonSecondary') THEN
        ALTER TABLE "public"."homepage_content" ADD COLUMN "heroButtonSecondary" TEXT DEFAULT 'Get Quote';
    END IF;

    RAISE NOTICE 'Homepage content table simplified successfully!';
    RAISE NOTICE 'Removed unnecessary columns and kept only essential hero section fields.';
    
END $$;

-- Update existing records with truck-focused defaults
UPDATE "public"."homepage_content" 
SET 
    "heroSubtitle" = 'Trucks',
    "heroDescription" = 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.',
    "heroButtonPrimary" = 'Explore Trucks'
WHERE "heroSubtitle" != 'Trucks' OR "heroButtonPrimary" != 'Explore Trucks';