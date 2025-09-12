-- ============================================================================
-- PHASE 1: NON-BREAKING ADDITIONS
-- Goal: Add new fields and tables without breaking existing functionality
-- ============================================================================

-- 1.1 User Enhancements
-- Add new user fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP;

-- Add new role option (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
    END IF;
    
    -- Add new role value if it doesn't exist
    BEGIN
        ALTER TYPE "Role" ADD VALUE 'SALES_REP';
    EXCEPTION
        WHEN duplicate_object THEN
            -- Value already exists, continue
            NULL;
    END;
END $$;

-- Add indexes for user management
CREATE INDEX IF NOT EXISTS "idx_users_role_active" ON users("role", "isActive");

-- ============================================================================

-- 1.2 Vehicle Enhancements
-- Add missing vehicle fields
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "vin" TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "stockNumber" TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0;

-- Add new status option (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
        CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');
    END IF;
    
    -- Add new status value if it doesn't exist
    BEGIN
        ALTER TYPE "Status" ADD VALUE 'MAINTENANCE';
    EXCEPTION
        WHEN duplicate_object THEN
            -- Value already exists, continue
            NULL;
    END;
END $$;

-- Add indexes for new vehicle fields
CREATE INDEX IF NOT EXISTS "idx_vehicles_make_fueltype" ON vehicles("make", "fuelType");

-- ============================================================================

-- 1.3 Category Enhancements
-- Add SEO and ordering fields
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER DEFAULT 0;

-- Update indexes
CREATE INDEX IF NOT EXISTS "idx_categories_active_order" ON categories("active", "displayOrder");

-- ============================================================================

-- 1.4 New Tables - Vehicle Specifications
-- Create SpecCategory enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpecCategory') THEN
        CREATE TYPE "SpecCategory" AS ENUM ('PERFORMANCE', 'INTERIOR', 'SAFETY', 'EXTERIOR', 'TECHNOLOGY', 'DIMENSIONS', 'CAPACITY');
    END IF;
END $$;

-- Create VehicleSpec table
CREATE TABLE IF NOT EXISTS "vehicle_specs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "category" "SpecCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_specs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key and indexes for vehicle specs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_specs_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_specs" ADD CONSTRAINT "vehicle_specs_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_vehicle_specs_vehicle_category" ON "vehicle_specs"("vehicleId", "category");
CREATE INDEX IF NOT EXISTS "idx_vehicle_specs_name_value" ON "vehicle_specs"("name", "value");

-- ============================================================================

-- 1.5 New Tables - Vehicle Features
-- Create VehicleFeature table
CREATE TABLE IF NOT EXISTS "vehicle_features" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_features_pkey" PRIMARY KEY ("id")
);

-- Add foreign key and indexes for vehicle features
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_features_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_features" ADD CONSTRAINT "vehicle_features_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_vehicle_features_vehicleId" ON "vehicle_features"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_vehicle_features_name" ON "vehicle_features"("name");

-- ============================================================================

-- 1.6 Enhanced Inquiries
-- Add new inquiry enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryType') THEN
        CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'PURCHASE', 'SERVICE', 'FINANCING', 'LEASING', 'PARTS');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
        CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    END IF;
END $$;

-- Extend existing InquiryStatus enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryStatus') THEN
        CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'RESOLVED');
    END IF;
    
    -- Add new values if they don't exist
    BEGIN
        ALTER TYPE "InquiryStatus" ADD VALUE 'QUALIFIED';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE "InquiryStatus" ADD VALUE 'PROPOSAL_SENT';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE "InquiryStatus" ADD VALUE 'NEGOTIATING';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE "InquiryStatus" ADD VALUE 'CLOSED_WON';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE "InquiryStatus" ADD VALUE 'CLOSED_LOST';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Add new inquiry fields
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "inquiryType" "InquiryType" DEFAULT 'GENERAL';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "priority" "Priority" DEFAULT 'MEDIUM';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "timeframe" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "assignedTo" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "followUpDate" TIMESTAMP;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP;

-- Add foreign key for assignedTo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiries_assignedTo_fkey') THEN
        ALTER TABLE inquiries ADD CONSTRAINT "inquiries_assignedTo_fkey" 
        FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add indexes for inquiries
CREATE INDEX IF NOT EXISTS "idx_inquiries_status_priority" ON inquiries("status", "priority");
CREATE INDEX IF NOT EXISTS "idx_inquiries_assigned" ON inquiries("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_inquiries_email" ON inquiries("email");

-- ============================================================================

-- 1.7 Inquiry History Tracking
-- Create InquiryHistory table
CREATE TABLE IF NOT EXISTS "inquiry_history" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiry_history_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys and indexes for inquiry history
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiry_history_inquiryId_fkey') THEN
        ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_inquiryId_fkey" 
        FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiry_history_userId_fkey') THEN
        ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_inquiry_history_inquiryId" ON "inquiry_history"("inquiryId");
CREATE INDEX IF NOT EXISTS "idx_inquiry_history_created" ON "inquiry_history"("createdAt");

-- ============================================================================

-- 1.8 Analytics Tables
-- Create AnalyticsEvent enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AnalyticsEvent') THEN
        CREATE TYPE "AnalyticsEvent" AS ENUM ('VIEW', 'INQUIRY', 'FAVORITE', 'SHARE', 'BROCHURE_DOWNLOAD');
    END IF;
END $$;

-- Create VehicleAnalytics table
CREATE TABLE IF NOT EXISTS "vehicle_analytics" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventType" "AnalyticsEvent" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_analytics_pkey" PRIMARY KEY ("id")
);

-- Add foreign key and indexes for vehicle analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_analytics_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_analytics" ADD CONSTRAINT "vehicle_analytics_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_vehicle_analytics_vehicle_event" ON "vehicle_analytics"("vehicleId", "eventType");
CREATE INDEX IF NOT EXISTS "idx_vehicle_analytics_created" ON "vehicle_analytics"("createdAt");

-- Create BusinessMetric enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BusinessMetric') THEN
        CREATE TYPE "BusinessMetric" AS ENUM ('DAILY_INQUIRIES', 'WEEKLY_VIEWS', 'MONTHLY_SALES', 'CONVERSION_RATE', 'POPULAR_VEHICLES', 'TOP_CATEGORIES');
    END IF;
END $$;

-- Create BusinessMetrics table
CREATE TABLE IF NOT EXISTS "business_metrics" (
    "id" TEXT NOT NULL,
    "metricType" "BusinessMetric" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- Add indexes for business metrics
CREATE INDEX IF NOT EXISTS "idx_business_metrics_type_date" ON "business_metrics"("metricType", "date");
CREATE INDEX IF NOT EXISTS "idx_business_metrics_date" ON "business_metrics"("date");

-- ============================================================================

-- 1.9 Enhanced Content Models
-- Homepage content enhancements
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "heroBackgroundImage" TEXT;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "heroBackgroundImageMobile" TEXT;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "totalVehiclesSold" INTEGER DEFAULT 150;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "feature1Icon" TEXT DEFAULT 'shield';
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "feature2Icon" TEXT DEFAULT 'truck';
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "feature3Icon" TEXT DEFAULT 'headphones';
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "comingSoonTitle" TEXT DEFAULT 'Exciting Updates Coming Soon';
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "comingSoonDescription" TEXT;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "showStatsSection" BOOLEAN DEFAULT true;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "showPartnersSection" BOOLEAN DEFAULT true;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- Company info enhancements
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS "employeeCount" INTEGER;
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS "coreValues" JSONB;

-- Contact info enhancements
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;

-- Technology content enhancements
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section1Image" TEXT;
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section1Icon" TEXT DEFAULT 'battery';
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section2Image" TEXT;
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section2Icon" TEXT DEFAULT 'wifi';
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section3Image" TEXT;
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section3Icon" TEXT DEFAULT 'zap';
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section4Image" TEXT;
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "section4Icon" TEXT DEFAULT 'leaf';
ALTER TABLE technology_content ADD COLUMN IF NOT EXISTS "additionalFeatures" JSONB;

-- ============================================================================

-- 1.10 Sessions Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL UNIQUE,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Add foreign key and indexes for sessions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessions_userId_fkey') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_sessions_sessionId" ON "sessions"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_sessions_userId" ON "sessions"("userId");

-- ============================================================================

-- 1.11 Filter Options Table
CREATE TABLE IF NOT EXISTS "filter_options" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "filter_options_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and indexes for filter options
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'filter_options_type_value_key') THEN
        ALTER TABLE "filter_options" ADD CONSTRAINT "filter_options_type_value_key" UNIQUE ("type", "value");
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_filter_options_type_active_order" ON "filter_options"("type", "active", "order");

-- ============================================================================
-- END PHASE 1: NON-BREAKING ADDITIONS
-- ============================================================================

-- Add trigger for updating updatedAt timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updatedAt triggers to relevant tables
DO $$
BEGIN
    -- Users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Categories table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Vehicles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vehicles_updated_at') THEN
        CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Vehicle specs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vehicle_specs_updated_at') THEN
        CREATE TRIGGER update_vehicle_specs_updated_at BEFORE UPDATE ON vehicle_specs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Inquiries table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_inquiries_updated_at') THEN
        CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sessions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_sessions_updated_at') THEN
        CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Homepage content table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_homepage_content_updated_at') THEN
        CREATE TRIGGER update_homepage_content_updated_at BEFORE UPDATE ON homepage_content
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Company info table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_company_info_updated_at') THEN
        CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Contact info table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_contact_info_updated_at') THEN
        CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Technology content table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_technology_content_updated_at') THEN
        CREATE TRIGGER update_technology_content_updated_at BEFORE UPDATE ON technology_content
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Filter options table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_filter_options_updated_at') THEN
        CREATE TRIGGER update_filter_options_updated_at BEFORE UPDATE ON filter_options
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT;