-- ============================================================================
-- PHASE 1: NON-BREAKING ADDITIONS (Prisma Compatible)
-- Goal: Add new fields and tables without breaking existing functionality
-- ============================================================================

-- 1.1 User Enhancements
-- Add new user fields (using ALTER TABLE ADD COLUMN without IF NOT EXISTS)
ALTER TABLE users ADD COLUMN "firstName" TEXT;
ALTER TABLE users ADD COLUMN "lastName" TEXT;
ALTER TABLE users ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN "lastLogin" TIMESTAMP;

-- 1.2 Vehicle Enhancements
-- Add missing vehicle fields
ALTER TABLE vehicles ADD COLUMN "model" TEXT;
ALTER TABLE vehicles ADD COLUMN "shortDescription" TEXT;
ALTER TABLE vehicles ADD COLUMN "originalPrice" DOUBLE PRECISION;
ALTER TABLE vehicles ADD COLUMN "vin" TEXT;
ALTER TABLE vehicles ADD COLUMN "stockNumber" TEXT;
ALTER TABLE vehicles ADD COLUMN "views" INTEGER DEFAULT 0;

-- 1.3 Category Enhancements
-- Add SEO and ordering fields
ALTER TABLE categories ADD COLUMN "metaTitle" TEXT;
ALTER TABLE categories ADD COLUMN "metaDescription" TEXT;
ALTER TABLE categories ADD COLUMN "displayOrder" INTEGER DEFAULT 0;

-- 1.4 Enhanced Content Models
-- Homepage content enhancements
ALTER TABLE homepage_content ADD COLUMN "heroBackgroundImage" TEXT;
ALTER TABLE homepage_content ADD COLUMN "heroBackgroundImageMobile" TEXT;
ALTER TABLE homepage_content ADD COLUMN "totalVehiclesSold" INTEGER DEFAULT 150;
ALTER TABLE homepage_content ADD COLUMN "feature1Icon" TEXT DEFAULT 'shield';
ALTER TABLE homepage_content ADD COLUMN "feature2Icon" TEXT DEFAULT 'truck';
ALTER TABLE homepage_content ADD COLUMN "feature3Icon" TEXT DEFAULT 'headphones';
ALTER TABLE homepage_content ADD COLUMN "comingSoonTitle" TEXT DEFAULT 'Exciting Updates Coming Soon';
ALTER TABLE homepage_content ADD COLUMN "comingSoonDescription" TEXT;
ALTER TABLE homepage_content ADD COLUMN "showStatsSection" BOOLEAN DEFAULT true;
ALTER TABLE homepage_content ADD COLUMN "showPartnersSection" BOOLEAN DEFAULT true;
ALTER TABLE homepage_content ADD COLUMN "metaTitle" TEXT;
ALTER TABLE homepage_content ADD COLUMN "metaDescription" TEXT;

-- Company info enhancements
ALTER TABLE company_info ADD COLUMN "logo" TEXT;
ALTER TABLE company_info ADD COLUMN "employeeCount" INTEGER;
ALTER TABLE company_info ADD COLUMN "coreValues" JSONB;

-- Contact info enhancements
ALTER TABLE contact_info ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE contact_info ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE contact_info ADD COLUMN "youtubeUrl" TEXT;

-- Technology content enhancements
ALTER TABLE technology_content ADD COLUMN "section1Image" TEXT;
ALTER TABLE technology_content ADD COLUMN "section1Icon" TEXT DEFAULT 'battery';
ALTER TABLE technology_content ADD COLUMN "section2Image" TEXT;
ALTER TABLE technology_content ADD COLUMN "section2Icon" TEXT DEFAULT 'wifi';
ALTER TABLE technology_content ADD COLUMN "section3Image" TEXT;
ALTER TABLE technology_content ADD COLUMN "section3Icon" TEXT DEFAULT 'zap';
ALTER TABLE technology_content ADD COLUMN "section4Image" TEXT;
ALTER TABLE technology_content ADD COLUMN "section4Icon" TEXT DEFAULT 'leaf';
ALTER TABLE technology_content ADD COLUMN "additionalFeatures" JSONB;

-- Inquiry enhancements
ALTER TABLE inquiries ADD COLUMN "firstName" TEXT;
ALTER TABLE inquiries ADD COLUMN "lastName" TEXT;
ALTER TABLE inquiries ADD COLUMN "company" TEXT;
ALTER TABLE inquiries ADD COLUMN "jobTitle" TEXT;
ALTER TABLE inquiries ADD COLUMN "source" TEXT;
ALTER TABLE inquiries ADD COLUMN "budget" DOUBLE PRECISION;
ALTER TABLE inquiries ADD COLUMN "timeframe" TEXT;
ALTER TABLE inquiries ADD COLUMN "assignedTo" TEXT;
ALTER TABLE inquiries ADD COLUMN "followUpDate" TIMESTAMP;
ALTER TABLE inquiries ADD COLUMN "closedAt" TIMESTAMP;
ALTER TABLE inquiries ADD COLUMN "inquiryType" TEXT DEFAULT 'GENERAL';
ALTER TABLE inquiries ADD COLUMN "priority" TEXT DEFAULT 'MEDIUM';