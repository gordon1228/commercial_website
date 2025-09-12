-- ============================================================================
-- PHASE 1B: CREATE NEW TABLES (Prisma Compatible)
-- ============================================================================

-- Create SpecCategory enum
CREATE TYPE "SpecCategory" AS ENUM ('PERFORMANCE', 'INTERIOR', 'SAFETY', 'EXTERIOR', 'TECHNOLOGY', 'DIMENSIONS', 'CAPACITY');

-- Create Priority enum  
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create InquiryType enum
CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'PURCHASE', 'SERVICE', 'FINANCING', 'LEASING', 'PARTS');

-- Create AnalyticsEvent enum
CREATE TYPE "AnalyticsEvent" AS ENUM ('VIEW', 'INQUIRY', 'FAVORITE', 'SHARE', 'BROCHURE_DOWNLOAD');

-- Create BusinessMetric enum
CREATE TYPE "BusinessMetric" AS ENUM ('DAILY_INQUIRIES', 'WEEKLY_VIEWS', 'MONTHLY_SALES', 'CONVERSION_RATE', 'POPULAR_VEHICLES', 'TOP_CATEGORIES');

-- Create VehicleSpec table
CREATE TABLE "vehicle_specs" (
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

-- Create VehicleFeature table
CREATE TABLE "vehicle_features" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_features_pkey" PRIMARY KEY ("id")
);

-- Create InquiryHistory table
CREATE TABLE "inquiry_history" (
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

-- Create VehicleAnalytics table
CREATE TABLE "vehicle_analytics" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventType" "AnalyticsEvent" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_analytics_pkey" PRIMARY KEY ("id")
);

-- Create BusinessMetrics table
CREATE TABLE "business_metrics" (
    "id" TEXT NOT NULL,
    "metricType" "BusinessMetric" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- Create Sessions table
CREATE TABLE "sessions" (
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

-- Create FilterOptions table
CREATE TABLE "filter_options" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "filter_options_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "filter_options_type_value_key" UNIQUE ("type", "value")
);