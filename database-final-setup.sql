-- ===============================================================================
-- COMMERCIAL VEHICLE PLATFORM - FINAL DATABASE SETUP (OPTIMIZED SCHEMA)
-- ===============================================================================
-- This script creates the complete optimized database schema with all required tables,
-- indexes, constraints, triggers, and initial data for the commercial vehicle platform.
-- 
-- Compatible with: PostgreSQL 12+, Neon, Supabase
-- Run this script in your PostgreSQL database to set up everything from scratch.
-- 
-- Version: 2.0 - Optimized Schema with Normalized Data and Enhanced Features
-- ===============================================================================

-- Create ENUM types first
DO $$ 
BEGIN
    -- Core Role types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'SALES_REP', 'USER');
    END IF;
    
    -- Vehicle Status types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
        CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'MAINTENANCE');
    END IF;
    
    -- Inquiry Management types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryStatus') THEN
        CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'RESOLVED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryType') THEN
        CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'PURCHASE', 'SERVICE', 'FINANCING', 'LEASING', 'PARTS');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
        CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    END IF;
    
    -- Vehicle Data types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpecCategory') THEN
        CREATE TYPE "SpecCategory" AS ENUM ('PERFORMANCE', 'INTERIOR', 'SAFETY', 'EXTERIOR', 'TECHNOLOGY', 'DIMENSIONS', 'CAPACITY');
    END IF;
    
    -- Analytics types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AnalyticsEvent') THEN
        CREATE TYPE "AnalyticsEvent" AS ENUM ('VIEW', 'INQUIRY', 'FAVORITE', 'SHARE', 'BROCHURE_DOWNLOAD');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BusinessMetric') THEN
        CREATE TYPE "BusinessMetric" AS ENUM ('DAILY_INQUIRIES', 'WEEKLY_VIEWS', 'MONTHLY_SALES', 'CONVERSION_RATE', 'POPULAR_VEHICLES', 'TOP_CATEGORIES');
    END IF;
END $$;

-- ===============================================================================
-- USER MANAGEMENT
-- ===============================================================================

-- Users table (Enhanced Authentication & Authorization)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Sessions table (Session management)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_sessionId_key" UNIQUE ("sessionId")
);

-- ===============================================================================
-- VEHICLE CATALOG (ENHANCED)
-- ===============================================================================

-- Categories table (Enhanced with SEO)
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_slug_key" UNIQUE ("slug")
);

-- Vehicles table (Enhanced)
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "name" TEXT NOT NULL,
    "model" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "images" TEXT[] NOT NULL DEFAULT '{}',
    "mobileImages" TEXT[] NOT NULL DEFAULT '{}',
    "specs" JSONB,
    "features" JSONB,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER DEFAULT 2024,
    "make" TEXT DEFAULT 'Isuzu',
    "fuelType" TEXT DEFAULT 'Electric',
    "transmission" TEXT,
    "vin" TEXT,
    "stockNumber" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vehicles_slug_key" UNIQUE ("slug")
);

-- Normalized Vehicle Specifications
CREATE TABLE IF NOT EXISTS "vehicle_specs" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
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

-- Normalized Vehicle Features
CREATE TABLE IF NOT EXISTS "vehicle_features" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vehicle_features_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- INQUIRY MANAGEMENT (ENHANCED)
-- ===============================================================================

-- Inquiries table (Enhanced CRM features)
CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "vehicleId" TEXT,
    "userId" TEXT,
    
    -- Customer Information (Enhanced)
    "customerName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    
    -- Inquiry Details
    "message" TEXT NOT NULL,
    "inquiryType" TEXT DEFAULT 'GENERAL',
    "priority" TEXT DEFAULT 'MEDIUM',
    "source" TEXT,
    "budget" DOUBLE PRECISION,
    "timeframe" TEXT,
    
    -- Internal Management
    "notes" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT,
    "followUpDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- Inquiry History for audit trail
CREATE TABLE IF NOT EXISTS "inquiry_history" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "inquiryId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "inquiry_history_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- ANALYTICS & BUSINESS INTELLIGENCE
-- ===============================================================================

-- Vehicle Analytics for business insights
CREATE TABLE IF NOT EXISTS "vehicle_analytics" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "vehicleId" TEXT NOT NULL,
    "eventType" "AnalyticsEvent" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vehicle_analytics_pkey" PRIMARY KEY ("id")
);

-- Business Metrics
CREATE TABLE IF NOT EXISTS "business_metrics" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "metricType" "BusinessMetric" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- CONTENT MANAGEMENT (ENHANCED)
-- ===============================================================================

-- Homepage content (Enhanced with more fields and controls)
CREATE TABLE IF NOT EXISTS "homepage_content" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    
    -- Hero Section
    "heroTitle" TEXT NOT NULL DEFAULT 'Premium Commercial Vehicles',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Electric Fleet Solutions',
    "heroDescription" TEXT NOT NULL DEFAULT 'Discover elite fleet solutions built for businesses that demand excellence.',
    "heroButtonPrimary" TEXT NOT NULL DEFAULT 'Explore Fleet',
    "heroButtonSecondary" TEXT NOT NULL DEFAULT 'Get Quote',
    "heroBackgroundImage" TEXT,
    "heroBackgroundImageMobile" TEXT,
    
    -- Statistics Section
    "happyClients" INTEGER NOT NULL DEFAULT 25,
    "yearsExperience" INTEGER NOT NULL DEFAULT 10,
    "satisfactionRate" INTEGER NOT NULL DEFAULT 95,
    "totalVehiclesSold" INTEGER NOT NULL DEFAULT 150,
    
    -- Partners Section
    "partnersTitle" TEXT NOT NULL DEFAULT 'Trusted by Industry Leaders',
    "partnersDescription" TEXT NOT NULL DEFAULT 'We partner with respected manufacturers.',
    
    -- Features Section
    "feature1Title" TEXT NOT NULL DEFAULT 'Quality Guarantee',
    "feature1Description" TEXT NOT NULL DEFAULT 'Rigorous inspection and warranty coverage.',
    "feature1Icon" TEXT NOT NULL DEFAULT 'shield',
    
    "feature2Title" TEXT NOT NULL DEFAULT 'Fast Delivery',
    "feature2Description" TEXT NOT NULL DEFAULT 'Quick processing and delivery.',
    "feature2Icon" TEXT NOT NULL DEFAULT 'truck',
    
    "feature3Title" TEXT NOT NULL DEFAULT '24/7 Support',
    "feature3Description" TEXT NOT NULL DEFAULT 'Round-the-clock customer support.',
    "feature3Icon" TEXT NOT NULL DEFAULT 'headphones',
    
    -- Coming Soon Section
    "comingSoonImage" TEXT NOT NULL DEFAULT '/images/coming-soon.jpg',
    "comingSoonImageAlt" TEXT NOT NULL DEFAULT 'Coming Soon',
    "comingSoonImageMobile" TEXT DEFAULT '/images/coming-soon-mobile.jpg',
    "comingSoonTitle" TEXT NOT NULL DEFAULT 'Exciting Updates Coming Soon',
    "comingSoonDescription" TEXT,
    
    -- Section Visibility Controls
    "showComingSoonSection" BOOLEAN NOT NULL DEFAULT true,
    "showHeroSection" BOOLEAN NOT NULL DEFAULT true,
    "showVehicleCategories" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedVehicles" BOOLEAN NOT NULL DEFAULT true,
    "showTrustSection" BOOLEAN NOT NULL DEFAULT true,
    "showStatsSection" BOOLEAN NOT NULL DEFAULT true,
    "showPartnersSection" BOOLEAN NOT NULL DEFAULT true,
    
    -- SEO
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- Company info (Enhanced)
CREATE TABLE IF NOT EXISTS "company_info" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    
    -- Basic Information
    "companyName" TEXT NOT NULL DEFAULT 'EVTL',
    "companyDescription" TEXT NOT NULL DEFAULT 'Leading provider of electric commercial vehicles.',
    "companyDescription2" TEXT NOT NULL DEFAULT 'Specialized fleet solutions for modern businesses.',
    "logo" TEXT,
    
    -- Company Details
    "foundedYear" INTEGER NOT NULL DEFAULT 1998,
    "totalHappyCustomers" INTEGER NOT NULL DEFAULT 850,
    "totalYearsExp" INTEGER NOT NULL DEFAULT 25,
    "satisfactionRate" INTEGER NOT NULL DEFAULT 98,
    "employeeCount" INTEGER,
    
    -- Story Content
    "storyTitle" TEXT NOT NULL DEFAULT 'Our Story',
    "storyParagraph1" TEXT NOT NULL DEFAULT 'Founded with a vision...',
    "storyParagraph2" TEXT NOT NULL DEFAULT 'Built on quality and trust...',
    "storyParagraph3" TEXT NOT NULL DEFAULT 'Leading into the future...',
    
    -- Mission & Vision
    "missionTitle" TEXT NOT NULL DEFAULT 'Our Mission',
    "missionText" TEXT NOT NULL DEFAULT 'Empowering businesses with sustainable transport.',
    "visionTitle" TEXT NOT NULL DEFAULT 'Our Vision',
    "visionText" TEXT NOT NULL DEFAULT 'Zero-emission commercial transportation future.',
    
    -- Values (consolidated from separate model)
    "coreValues" JSONB,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- Contact info (Enhanced)
CREATE TABLE IF NOT EXISTS "contact_info" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    
    -- Contact Details
    "salesPhone" TEXT NOT NULL DEFAULT '+60 10 339 1414',
    "servicePhone" TEXT NOT NULL DEFAULT '+60 16 332 2349',
    "financePhone" TEXT NOT NULL DEFAULT '+60 16 332 2349',
    "salesEmail" TEXT NOT NULL DEFAULT 'sales@evtl.com.my',
    "serviceEmail" TEXT NOT NULL DEFAULT 'service@evtl.com.my',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@evtl.com.my',
    
    -- Address Information
    "address" TEXT NOT NULL DEFAULT '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    "city" TEXT NOT NULL DEFAULT 'Kajang',
    "state" TEXT NOT NULL DEFAULT 'Selangor',
    "postcode" TEXT NOT NULL DEFAULT '43000',
    "country" TEXT NOT NULL DEFAULT 'Malaysia',
    "directions" TEXT NOT NULL DEFAULT 'EVTL Trucks Office',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    
    -- Business Hours
    "mondayToFriday" TEXT NOT NULL DEFAULT '9:00 AM - 6:00 PM',
    "saturday" TEXT NOT NULL DEFAULT '9:00 AM - 1:00 PM',
    "sunday" TEXT NOT NULL DEFAULT 'Closed',
    
    -- Website Settings
    "siteName" TEXT NOT NULL DEFAULT 'EVTL',
    "companyDescription" TEXT NOT NULL DEFAULT 'Next-generation mobility startup focusing on Electric Trucks.',
    
    -- Social Media
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "twitterUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "linkedinUrl" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT,
    
    -- Legal Pages
    "privacyPolicyUrl" TEXT NOT NULL DEFAULT '/privacy',
    "termsOfServiceUrl" TEXT NOT NULL DEFAULT '/terms',
    
    -- System Settings
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- Technology content (Enhanced)
CREATE TABLE IF NOT EXISTS "technology_content" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    
    -- Hero Section
    "heroTitle" TEXT NOT NULL DEFAULT 'Next-Generation Electric Technology',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Advanced EV technology for commercial success',
    "heroBackgroundImage" TEXT NOT NULL DEFAULT '/uploads/technology-hero.png',
    "heroBackgroundImageAlt" TEXT NOT NULL DEFAULT 'Electric Truck Technology',
    
    -- Technology Sections
    "section1Title" TEXT NOT NULL DEFAULT 'Advanced Battery Technology',
    "section1Description" TEXT NOT NULL DEFAULT 'Exceptional range and durability for commercial use.',
    "section1Image" TEXT,
    "section1Icon" TEXT NOT NULL DEFAULT 'battery',
    
    "section2Title" TEXT NOT NULL DEFAULT 'Smart Fleet Management',
    "section2Description" TEXT NOT NULL DEFAULT 'IoT solutions for monitoring and optimization.',
    "section2Image" TEXT,
    "section2Icon" TEXT NOT NULL DEFAULT 'wifi',
    
    "section3Title" TEXT NOT NULL DEFAULT 'Rapid Charging Infrastructure',
    "section3Description" TEXT NOT NULL DEFAULT 'Fast-charging to minimize downtime.',
    "section3Image" TEXT,
    "section3Icon" TEXT NOT NULL DEFAULT 'zap',
    
    "section4Title" TEXT NOT NULL DEFAULT 'Sustainable Manufacturing',
    "section4Description" TEXT NOT NULL DEFAULT 'Eco-friendly production processes.',
    "section4Image" TEXT,
    "section4Icon" TEXT NOT NULL DEFAULT 'leaf',
    
    -- Additional Features (normalized from separate model)
    "additionalFeatures" JSONB,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "technology_content_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- CONFIGURATION & FILTERS
-- ===============================================================================

-- Filter Options (Dynamic filtering system)
CREATE TABLE IF NOT EXISTS "filter_options" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "filter_options_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "filter_options_type_value_key" UNIQUE ("type", "value")
);

-- ===============================================================================
-- LEGACY TABLES (Maintained for backward compatibility)
-- ===============================================================================

-- Company values (legacy)
CREATE TABLE IF NOT EXISTS "company_values" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "company_values_pkey" PRIMARY KEY ("id")
);

-- Certifications (legacy)
CREATE TABLE IF NOT EXISTS "certifications" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- Technology features (legacy)
CREATE TABLE IF NOT EXISTS "technology_features" (
    "id" TEXT NOT NULL DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'star',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "technology_features_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ===============================================================================

-- Add foreign key constraints
DO $$
BEGIN
    -- Sessions -> Users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessions_userId_fkey') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Vehicles -> Categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicles_categoryId_fkey') THEN
        ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Vehicle Specs -> Vehicles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_specs_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_specs" ADD CONSTRAINT "vehicle_specs_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Vehicle Features -> Vehicles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_features_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_features" ADD CONSTRAINT "vehicle_features_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Inquiries -> Vehicles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiries_vehicleId_fkey') THEN
        ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Inquiries -> Users (customer)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiries_userId_fkey') THEN
        ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Inquiries -> Users (assigned to)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiries_assignedTo_fkey') THEN
        ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignedTo_fkey" 
        FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Inquiry History -> Inquiries
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiry_history_inquiryId_fkey') THEN
        ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_inquiryId_fkey" 
        FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Inquiry History -> Users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inquiry_history_userId_fkey') THEN
        ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Vehicle Analytics -> Vehicles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vehicle_analytics_vehicleId_fkey') THEN
        ALTER TABLE "vehicle_analytics" ADD CONSTRAINT "vehicle_analytics_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ===============================================================================
-- INDEXES FOR PERFORMANCE
-- ===============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role_active" ON "users"("role", "isActive");

CREATE INDEX IF NOT EXISTS "idx_sessions_sessionId" ON "sessions"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_sessions_userId" ON "sessions"("userId");

CREATE INDEX IF NOT EXISTS "idx_categories_active_order" ON "categories"("active", "displayOrder");
CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories"("slug");

CREATE INDEX IF NOT EXISTS "idx_vehicles_active_featured" ON "vehicles"("active", "featured");
CREATE INDEX IF NOT EXISTS "idx_vehicles_categoryId_active" ON "vehicles"("categoryId", "active");
CREATE INDEX IF NOT EXISTS "idx_vehicles_status_active" ON "vehicles"("status", "active");
CREATE INDEX IF NOT EXISTS "idx_vehicles_slug" ON "vehicles"("slug");
CREATE INDEX IF NOT EXISTS "idx_vehicles_make_fueltype" ON "vehicles"("make", "fuelType");

CREATE INDEX IF NOT EXISTS "idx_vehicle_specs_vehicle_category" ON "vehicle_specs"("vehicleId", "category");
CREATE INDEX IF NOT EXISTS "idx_vehicle_specs_name_value" ON "vehicle_specs"("name", "value");

CREATE INDEX IF NOT EXISTS "idx_vehicle_features_vehicleId" ON "vehicle_features"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_vehicle_features_name" ON "vehicle_features"("name");

CREATE INDEX IF NOT EXISTS "idx_inquiries_status_priority" ON "inquiries"("status", "priority");
CREATE INDEX IF NOT EXISTS "idx_inquiries_vehicleId" ON "inquiries"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_inquiries_assigned" ON "inquiries"("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_inquiries_email" ON "inquiries"("email");
CREATE INDEX IF NOT EXISTS "idx_inquiries_createdAt" ON "inquiries"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_inquiry_history_inquiryId" ON "inquiry_history"("inquiryId");
CREATE INDEX IF NOT EXISTS "idx_inquiry_history_created" ON "inquiry_history"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_vehicle_analytics_vehicle_event" ON "vehicle_analytics"("vehicleId", "eventType");
CREATE INDEX IF NOT EXISTS "idx_vehicle_analytics_created" ON "vehicle_analytics"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_business_metrics_type_date" ON "business_metrics"("metricType", "date");
CREATE INDEX IF NOT EXISTS "idx_business_metrics_date" ON "business_metrics"("date");

CREATE INDEX IF NOT EXISTS "idx_filter_options_type_active_order" ON "filter_options"("type", "active", "order");

-- ===============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===============================================================================

-- Function for updating updatedAt timestamps
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
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sessions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_sessions_updated_at') THEN
        CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON "sessions"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Categories table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Vehicles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vehicles_updated_at') THEN
        CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "vehicles"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Vehicle specs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vehicle_specs_updated_at') THEN
        CREATE TRIGGER update_vehicle_specs_updated_at BEFORE UPDATE ON "vehicle_specs"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Inquiries table
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_inquiries_updated_at') THEN
        CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON "inquiries"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Content tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_homepage_content_updated_at') THEN
        CREATE TRIGGER update_homepage_content_updated_at BEFORE UPDATE ON "homepage_content"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_company_info_updated_at') THEN
        CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON "company_info"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_contact_info_updated_at') THEN
        CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON "contact_info"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_technology_content_updated_at') THEN
        CREATE TRIGGER update_technology_content_updated_at BEFORE UPDATE ON "technology_content"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Legacy tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_company_values_updated_at') THEN
        CREATE TRIGGER update_company_values_updated_at BEFORE UPDATE ON "company_values"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_certifications_updated_at') THEN
        CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON "certifications"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_technology_features_updated_at') THEN
        CREATE TRIGGER update_technology_features_updated_at BEFORE UPDATE ON "technology_features"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===============================================================================
-- INITIAL DATA SETUP
-- ===============================================================================

-- Insert initial filter options
INSERT INTO "filter_options" ("id", "type", "value", "label", "order", "active") VALUES
('filter_status_available', 'status', 'AVAILABLE', 'Available', 1, true),
('filter_status_reserved', 'status', 'RESERVED', 'Reserved', 2, true),
('filter_status_sold', 'status', 'SOLD', 'Sold', 3, true),
('filter_status_maintenance', 'status', 'MAINTENANCE', 'Maintenance', 4, true),
('filter_fueltype_electric', 'fuelType', 'Electric', 'Electric', 1, true),
('filter_fueltype_diesel', 'fuelType', 'Diesel', 'Diesel', 2, true),
('filter_fueltype_hybrid', 'fuelType', 'Hybrid', 'Hybrid', 3, true),
('filter_make_isuzu', 'make', 'Isuzu', 'Isuzu', 1, true),
('filter_transmission_automatic', 'transmission', 'Automatic', 'Automatic', 1, true),
('filter_transmission_manual', 'transmission', 'Manual', 'Manual', 2, true)
ON CONFLICT ("type", "value") DO NOTHING;

-- ===============================================================================
-- COMPLETION MESSAGE
-- ===============================================================================

DO $$
BEGIN
    RAISE NOTICE '===============================================================================';
    RAISE NOTICE 'COMMERCIAL VEHICLE PLATFORM DATABASE SETUP COMPLETE!';
    RAISE NOTICE '===============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Schema Version: 2.0 (Optimized)';
    RAISE NOTICE '✅ Core Tables: 18 tables created';
    RAISE NOTICE '✅ Enhanced Features: Analytics, CRM, SEO, Normalized Data';
    RAISE NOTICE '✅ Performance: 26 indexes created for optimal performance';
    RAISE NOTICE '✅ Data Integrity: Foreign key constraints and triggers active';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for production use!';
    RAISE NOTICE '📊 Supports: Vehicle catalog, Inquiry management, Analytics, Content management';
    RAISE NOTICE '🔧 Compatible with: Prisma ORM, Next.js, PostgreSQL 12+';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: npx prisma db pull && npx prisma generate';
    RAISE NOTICE '2. Populate with your initial data';
    RAISE NOTICE '3. Test all application functionality';
    RAISE NOTICE '===============================================================================';
END $$;