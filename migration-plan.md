# Database Schema Migration Plan

## Overview
This document outlines the migration from the current schema to the optimized schema based on actual codebase analysis and business requirements.

---

## Migration Strategy

### Phase 1: Non-Breaking Additions (Safe to deploy)
**Goal**: Add new fields and tables without breaking existing functionality

### Phase 2: Data Migration (Requires downtime)
**Goal**: Migrate existing data to new structure 

### Phase 3: Schema Cleanup (Optional)
**Goal**: Remove unused fields and optimize

---

## Phase 1: Non-Breaking Additions

### 1.1 User Enhancements
```sql
-- Add new user fields
ALTER TABLE users ADD COLUMN "firstName" TEXT;
ALTER TABLE users ADD COLUMN "lastName" TEXT;
ALTER TABLE users ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN "lastLogin" TIMESTAMP;

-- Add new role option
ALTER TYPE "Role" ADD VALUE 'SALES_REP';

-- Add indexes
CREATE INDEX "idx_users_role_active" ON users("role", "isActive");
```

### 1.2 Vehicle Enhancements
```sql
-- Add missing vehicle fields
ALTER TABLE vehicles ADD COLUMN "model" TEXT;
ALTER TABLE vehicles ADD COLUMN "shortDescription" TEXT;
ALTER TABLE vehicles ADD COLUMN "originalPrice" DOUBLE PRECISION;
ALTER TABLE vehicles ADD COLUMN "vin" TEXT;
ALTER TABLE vehicles ADD COLUMN "stockNumber" TEXT;
ALTER TABLE vehicles ADD COLUMN "views" INTEGER DEFAULT 0;

-- Add new status options
ALTER TYPE "Status" ADD VALUE 'MAINTENANCE';

-- Add indexes for new fields
CREATE INDEX "idx_vehicles_make_fueltype" ON vehicles("make", "fuelType");
```

### 1.3 Category Enhancements
```sql
-- Add SEO and ordering fields
ALTER TABLE categories ADD COLUMN "metaTitle" TEXT;
ALTER TABLE categories ADD COLUMN "metaDescription" TEXT;
ALTER TABLE categories ADD COLUMN "displayOrder" INTEGER DEFAULT 0;

-- Update indexes
CREATE INDEX "idx_categories_active_order" ON categories("active", "displayOrder");
```

### 1.4 New Tables - Vehicle Specifications
```sql
-- Create SpecCategory enum
CREATE TYPE "SpecCategory" AS ENUM ('PERFORMANCE', 'INTERIOR', 'SAFETY', 'EXTERIOR', 'TECHNOLOGY', 'DIMENSIONS', 'CAPACITY');

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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_specs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key and indexes
ALTER TABLE "vehicle_specs" ADD CONSTRAINT "vehicle_specs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "idx_vehicle_specs_vehicle_category" ON "vehicle_specs"("vehicleId", "category");
CREATE INDEX "idx_vehicle_specs_name_value" ON "vehicle_specs"("name", "value");
```

### 1.5 New Tables - Vehicle Features
```sql
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

-- Add foreign key and indexes
ALTER TABLE "vehicle_features" ADD CONSTRAINT "vehicle_features_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "idx_vehicle_features_vehicleId" ON "vehicle_features"("vehicleId");
CREATE INDEX "idx_vehicle_features_name" ON "vehicle_features"("name");
```

### 1.6 Enhanced Inquiries
```sql
-- Add new inquiry enums
CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'PURCHASE', 'SERVICE', 'FINANCING', 'LEASING', 'PARTS');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Extend existing InquiryStatus enum
ALTER TYPE "InquiryStatus" ADD VALUE 'QUALIFIED';
ALTER TYPE "InquiryStatus" ADD VALUE 'PROPOSAL_SENT';
ALTER TYPE "InquiryStatus" ADD VALUE 'NEGOTIATING';
ALTER TYPE "InquiryStatus" ADD VALUE 'CLOSED_WON';
ALTER TYPE "InquiryStatus" ADD VALUE 'CLOSED_LOST';

-- Add new inquiry fields
ALTER TABLE inquiries ADD COLUMN "firstName" TEXT;
ALTER TABLE inquiries ADD COLUMN "lastName" TEXT;
ALTER TABLE inquiries ADD COLUMN "company" TEXT;
ALTER TABLE inquiries ADD COLUMN "jobTitle" TEXT;
ALTER TABLE inquiries ADD COLUMN "inquiryType" "InquiryType" DEFAULT 'GENERAL';
ALTER TABLE inquiries ADD COLUMN "priority" "Priority" DEFAULT 'MEDIUM';
ALTER TABLE inquiries ADD COLUMN "source" TEXT;
ALTER TABLE inquiries ADD COLUMN "budget" DOUBLE PRECISION;
ALTER TABLE inquiries ADD COLUMN "timeframe" TEXT;
ALTER TABLE inquiries ADD COLUMN "assignedTo" TEXT;
ALTER TABLE inquiries ADD COLUMN "followUpDate" TIMESTAMP;
ALTER TABLE inquiries ADD COLUMN "closedAt" TIMESTAMP;

-- Add foreign key for assignedTo
ALTER TABLE inquiries ADD CONSTRAINT "inquiries_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "idx_inquiries_status_priority" ON inquiries("status", "priority");
CREATE INDEX "idx_inquiries_assigned" ON inquiries("assignedTo");
CREATE INDEX "idx_inquiries_email" ON inquiries("email");
```

### 1.7 Inquiry History Tracking
```sql
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

-- Add foreign keys and indexes
ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "idx_inquiry_history_inquiryId" ON "inquiry_history"("inquiryId");
CREATE INDEX "idx_inquiry_history_created" ON "inquiry_history"("createdAt");
```

### 1.8 Analytics Tables
```sql
-- Create AnalyticsEvent enum
CREATE TYPE "AnalyticsEvent" AS ENUM ('VIEW', 'INQUIRY', 'FAVORITE', 'SHARE', 'BROCHURE_DOWNLOAD');

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

-- Add foreign key and indexes
ALTER TABLE "vehicle_analytics" ADD CONSTRAINT "vehicle_analytics_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "idx_vehicle_analytics_vehicle_event" ON "vehicle_analytics"("vehicleId", "eventType");
CREATE INDEX "idx_vehicle_analytics_created" ON "vehicle_analytics"("createdAt");

-- Create BusinessMetric enum
CREATE TYPE "BusinessMetric" AS ENUM ('DAILY_INQUIRIES', 'WEEKLY_VIEWS', 'MONTHLY_SALES', 'CONVERSION_RATE', 'POPULAR_VEHICLES', 'TOP_CATEGORIES');

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

-- Add indexes
CREATE INDEX "idx_business_metrics_type_date" ON "business_metrics"("metricType", "date");
CREATE INDEX "idx_business_metrics_date" ON "business_metrics"("date");
```

### 1.9 Enhanced Content Models
```sql
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
```

---

## Phase 2: Data Migration Scripts

### 2.1 Migrate Vehicle Specifications
```sql
-- Function to migrate JSON specs to normalized structure
CREATE OR REPLACE FUNCTION migrate_vehicle_specs() 
RETURNS void AS $$
DECLARE
    vehicle_record RECORD;
    spec_key TEXT;
    spec_value TEXT;
    spec_category "SpecCategory";
BEGIN
    FOR vehicle_record IN SELECT id, specs FROM vehicles WHERE specs IS NOT NULL
    LOOP
        FOR spec_key, spec_value IN 
            SELECT key, value FROM jsonb_each_text(vehicle_record.specs)
        LOOP
            -- Determine category based on spec key
            spec_category := CASE 
                WHEN spec_key IN ('fuel', 'engine', 'horsepower', 'torque', 'displacement', 'transmission', 'drivetrain', 'fuelCapacity') THEN 'PERFORMANCE'
                WHEN spec_key IN ('capacity', 'seatingCapacity', 'cabinSpace', 'legRoom', 'interior', 'comfort', 'airConditioning', 'upholstery', 'dashboard', 'infotainment', 'storage') THEN 'INTERIOR'
                WHEN spec_key IN ('abs', 'esc', 'tcs', 'brakes', 'airbags', 'seatbelts', 'crumpleZones', 'reinforcement', 'safetyRating', 'rating', 'safety', 'compliance') THEN 'SAFETY'
                WHEN spec_key IN ('weight', 'features', 'technology') THEN 'DIMENSIONS'
                ELSE 'PERFORMANCE'
            END;
            
            -- Insert normalized spec
            INSERT INTO vehicle_specs (id, "vehicleId", category, name, value, "displayOrder")
            VALUES (
                'spec_' || vehicle_record.id || '_' || spec_key,
                vehicle_record.id,
                spec_category,
                spec_key,
                spec_value,
                0
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_vehicle_specs();
```

### 2.2 Migrate Vehicle Features
```sql
-- Function to migrate features array to normalized structure  
CREATE OR REPLACE FUNCTION migrate_vehicle_features()
RETURNS void AS $$
DECLARE
    vehicle_record RECORD;
    feature_name TEXT;
BEGIN
    FOR vehicle_record IN SELECT id, features FROM vehicles WHERE features IS NOT NULL
    LOOP
        FOR feature_name IN 
            SELECT jsonb_array_elements_text(vehicle_record.features)
        LOOP
            INSERT INTO vehicle_features (id, "vehicleId", name, included, "displayOrder")
            VALUES (
                'feat_' || vehicle_record.id || '_' || encode(digest(feature_name, 'sha256'), 'hex')[:10],
                vehicle_record.id,
                feature_name,
                true,
                0
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_vehicle_features();
```

### 2.3 Update Inquiry Data
```sql
-- Split customer names if they contain spaces
UPDATE inquiries 
SET 
    "firstName" = CASE 
        WHEN position(' ' in "customerName") > 0 
        THEN substring("customerName" from 1 for position(' ' in "customerName") - 1)
        ELSE "customerName"
    END,
    "lastName" = CASE 
        WHEN position(' ' in "customerName") > 0 
        THEN substring("customerName" from position(' ' in "customerName") + 1)
        ELSE NULL
    END
WHERE "firstName" IS NULL AND "lastName" IS NULL;
```

---

## Phase 3: Schema Cleanup (Optional)

### 3.1 Remove Unused Fields
```sql
-- Remove old JSON specs field (after confirming migration success)
-- ALTER TABLE vehicles DROP COLUMN specs;

-- Remove old features array (after confirming migration success) 
-- ALTER TABLE vehicles DROP COLUMN features;

-- Remove unused models that were consolidated
-- DROP TABLE company_values;
-- DROP TABLE certifications;
-- DROP TABLE technology_features;
```

---

## Implementation Steps

### Step 1: Backup Current Database
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Phase 1 Migrations
```bash
# Apply each migration SQL script in order
psql $DATABASE_URL -f phase1_migrations.sql
```

### Step 3: Test Application
- Verify all existing functionality works
- Test admin interfaces
- Check API endpoints

### Step 4: Apply Phase 2 Data Migration
```bash
psql $DATABASE_URL -f phase2_data_migration.sql
```

### Step 5: Update Prisma Schema
```bash
# Replace current schema.prisma with schema-optimized.prisma
cp schema-optimized.prisma schema.prisma
npx prisma generate
```

### Step 6: Update Application Code
- Update TypeScript interfaces
- Modify API routes to use new relationships  
- Update admin forms to use normalized data
- Add new analytics tracking

---

## Benefits of New Schema

### 🚀 **Performance Improvements**
- **Indexed specifications**: Fast filtering by vehicle specs
- **Normalized features**: Efficient feature-based searches
- **Optimized relationships**: Better join performance

### 📊 **Better Analytics** 
- **Vehicle view tracking**: Understand popular vehicles
- **Business metrics**: Track KPIs and conversion rates
- **Inquiry analytics**: Sales funnel insights

### 🛠 **Enhanced Functionality**
- **Advanced inquiry management**: Priority, assignment, history
- **Better user management**: Roles, activity tracking
- **SEO optimization**: Meta fields for better search ranking

### 🔧 **Developer Experience**
- **Type-safe specifications**: No more JSON parsing
- **Consistent relationships**: Proper foreign keys
- **Audit trails**: Track all changes

---

## Risk Assessment

### Low Risk ✅
- Adding new fields and tables
- Adding enum values
- Creating new indexes

### Medium Risk ⚠️  
- Data migration scripts
- Updating existing relationships
- Modifying enum types

### High Risk 🚨
- Removing existing fields
- Changing data types
- Breaking API contracts

---

## Rollback Plan

### If Migration Fails:
1. **Stop application**
2. **Restore from backup**: `psql $DATABASE_URL < backup_file.sql`
3. **Revert code changes**
4. **Restart application**

### If Issues Found After Migration:
1. **Keep application running** (new schema is backward compatible)
2. **Fix specific issues** with targeted patches
3. **Consider partial rollback** of problematic features only

---

This migration plan provides a safe, phased approach to upgrading your database schema while maintaining system stability and improving functionality.