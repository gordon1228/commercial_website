-- ===============================================================================
-- COMMERCIAL VEHICLE PLATFORM - FINAL DATABASE SETUP
-- ===============================================================================
-- This script creates the complete database schema with all required tables,
-- indexes, constraints, triggers, and initial data for the commercial vehicle platform.
-- 
-- Compatible with: PostgreSQL 12+, Neon, Supabase
-- Run this script in your PostgreSQL database to set up everything from scratch.
-- ===============================================================================

-- Create ENUM types first
DO $$ 
BEGIN
    -- Check if the type exists before creating it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
        CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryStatus') THEN
        CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'RESOLVED', 'CLOSED');
    END IF;
END $$;

-- ===============================================================================
-- CORE TABLES
-- ===============================================================================

-- Users table (Authentication & Authorization)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Sessions table (Session management)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Categories table (Vehicle categories)
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Vehicles table (Main vehicle listings)
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "images" TEXT[] DEFAULT '{}',
    "mobileImages" TEXT[] DEFAULT '{}',
    "specs" JSONB,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER DEFAULT 2024,
    "make" TEXT DEFAULT 'Isuzu',
    "fuelType" TEXT DEFAULT 'Electric',
    "transmission" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- Inquiries table (Customer inquiries)
CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "notes" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- CONTENT MANAGEMENT TABLES
-- ===============================================================================

-- Homepage Content table
CREATE TABLE IF NOT EXISTS "homepage_content" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Premium Commercial',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Vehicles',
    "heroDescription" TEXT NOT NULL DEFAULT 'Discover elite fleet solutions built for businesses that demand excellence, reliability, and uncompromising quality.',
    "heroButtonPrimary" TEXT NOT NULL DEFAULT 'Explore Fleet',
    "heroButtonSecondary" TEXT NOT NULL DEFAULT 'Get Quote',
    "happyClients" INTEGER NOT NULL DEFAULT 25,
    "yearsExperience" INTEGER NOT NULL DEFAULT 10,
    "satisfactionRate" INTEGER NOT NULL DEFAULT 95,
    "partnersTitle" TEXT NOT NULL DEFAULT 'Trusted by Industry Leaders',
    "partnersDescription" TEXT NOT NULL DEFAULT 'We partner with the world''s most respected commercial vehicle manufacturers to bring you unparalleled quality and reliability.',
    "feature1Title" TEXT NOT NULL DEFAULT 'Quality Guarantee',
    "feature1Description" TEXT NOT NULL DEFAULT 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage.',
    "feature2Title" TEXT NOT NULL DEFAULT 'Fast Delivery',
    "feature2Description" TEXT NOT NULL DEFAULT 'Quick processing and delivery to get your business moving without unnecessary delays.',
    "feature3Title" TEXT NOT NULL DEFAULT '24/7 Support',
    "feature3Description" TEXT NOT NULL DEFAULT 'Round-the-clock customer support to assist you with any questions or concerns.',
    "comingSoonImage" TEXT NOT NULL DEFAULT '/images/comming soon.jpg',
    "comingSoonImageMobile" TEXT DEFAULT '/images/comming-soon-mobile.jpg',
    "comingSoonImageAlt" TEXT NOT NULL DEFAULT 'Coming Soon',
    "showComingSoonSection" BOOLEAN DEFAULT true,
    "showHeroSection" BOOLEAN DEFAULT true,
    "showVehicleCategories" BOOLEAN DEFAULT true,
    "showFeaturedVehicles" BOOLEAN DEFAULT true,
    "showTrustSection" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- Company Info table
CREATE TABLE IF NOT EXISTS "company_info" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'EVTL',
    "companyDescription" TEXT NOT NULL DEFAULT 'For over 25 years, we''ve been the trusted partner for businesses seeking premium commercial trucks.',
    "foundedYear" INTEGER NOT NULL DEFAULT 1998,
    "totalVehiclesSold" INTEGER NOT NULL DEFAULT 2500,
    "totalHappyCustomers" INTEGER NOT NULL DEFAULT 850,
    "totalYearsExp" INTEGER NOT NULL DEFAULT 25,
    "satisfactionRate" INTEGER NOT NULL DEFAULT 98,
    "storyTitle" TEXT NOT NULL DEFAULT 'Our Story',
    "storyParagraph1" TEXT NOT NULL DEFAULT 'Founded in 1998, EVTL began as a small family business.',
    "storyParagraph2" TEXT NOT NULL DEFAULT 'Over the years, we''ve built our reputation on quality.',
    "storyParagraph3" TEXT NOT NULL DEFAULT 'Today, we continue to evolve with the industry.',
    "missionTitle" TEXT NOT NULL DEFAULT 'Our Mission',
    "missionText" TEXT NOT NULL DEFAULT 'To empower businesses with premium commercial trucks.',
    "visionTitle" TEXT NOT NULL DEFAULT 'Our Vision',
    "visionText" TEXT NOT NULL DEFAULT 'To be the leading commercial truck provider.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- Company Values table
CREATE TABLE IF NOT EXISTS "company_values" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "company_values_pkey" PRIMARY KEY ("id")
);

-- Certifications table
CREATE TABLE IF NOT EXISTS "certifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- Partners table
CREATE TABLE IF NOT EXISTS "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- Contact Info table
CREATE TABLE IF NOT EXISTS "contact_info" (
    "id" TEXT NOT NULL,
    "salesPhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    "servicePhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4568',
    "financePhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4569',
    "salesEmail" TEXT NOT NULL DEFAULT 'sales@evtl.com',
    "serviceEmail" TEXT NOT NULL DEFAULT 'service@evtl.com',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@evtl.com',
    "address" TEXT NOT NULL DEFAULT '123 Business Avenue',
    "city" TEXT NOT NULL DEFAULT 'Commercial District, NY 10001',
    "state" TEXT DEFAULT 'NY',
    "postcode" TEXT DEFAULT '10001',
    "country" TEXT DEFAULT 'United States',
    "directions" TEXT NOT NULL DEFAULT 'Near Metro Station',
    "mondayToFriday" TEXT NOT NULL DEFAULT '8:00 AM - 6:00 PM',
    "saturday" TEXT NOT NULL DEFAULT '9:00 AM - 4:00 PM',
    "sunday" TEXT NOT NULL DEFAULT 'Closed',
    "siteName" TEXT DEFAULT 'EVTL',
    "companyDescription" TEXT DEFAULT 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
    "emailNotifications" BOOLEAN DEFAULT true,
    "systemNotifications" BOOLEAN DEFAULT true,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "facebookUrl" TEXT DEFAULT '',
    "twitterUrl" TEXT DEFAULT '',
    "instagramUrl" TEXT DEFAULT '',
    "linkedinUrl" TEXT DEFAULT '',
    "privacyPolicyUrl" TEXT DEFAULT '/privacy',
    "termsOfServiceUrl" TEXT DEFAULT '/terms',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- Technology Content table
CREATE TABLE IF NOT EXISTS "technology_content" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Next-Generation Electric Truck Technology',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Advanced electric vehicle technology designed for commercial success and environmental sustainability',
    "heroBackgroundImage" TEXT NOT NULL DEFAULT '/uploads/Technology_background.png',
    "heroBackgroundImageAlt" TEXT NOT NULL DEFAULT 'Electric Truck Technology Background',
    "section1Title" TEXT NOT NULL DEFAULT 'Advanced Battery Technology',
    "section1Description" TEXT NOT NULL DEFAULT 'Our cutting-edge battery systems provide exceptional range and durability for commercial applications.',
    "section2Title" TEXT NOT NULL DEFAULT 'Smart Fleet Management',
    "section2Description" TEXT NOT NULL DEFAULT 'Integrated IoT solutions for real-time monitoring, maintenance prediction, and route optimization.',
    "section3Title" TEXT NOT NULL DEFAULT 'Rapid Charging Infrastructure',
    "section3Description" TEXT NOT NULL DEFAULT 'Fast-charging capabilities designed to minimize downtime and maximize operational efficiency.',
    "section4Title" TEXT NOT NULL DEFAULT 'Sustainable Manufacturing',
    "section4Description" TEXT NOT NULL DEFAULT 'Eco-friendly production processes that reduce environmental impact while maintaining quality.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "technology_content_pkey" PRIMARY KEY ("id")
);

-- Technology Features table
CREATE TABLE IF NOT EXISTS "technology_features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Zap',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "technology_features_pkey" PRIMARY KEY ("id")
);

-- ===============================================================================
-- INDEXES FOR PERFORMANCE
-- ===============================================================================

-- Core table indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionId_key" ON "sessions"("sessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_slug_key" ON "vehicles"("slug");

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_categories_active" ON "categories"("active");
CREATE INDEX IF NOT EXISTS "idx_vehicles_active" ON "vehicles"("active");
CREATE INDEX IF NOT EXISTS "idx_vehicles_category_id" ON "vehicles"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_vehicles_featured" ON "vehicles"("featured");
CREATE INDEX IF NOT EXISTS "idx_vehicles_status" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "idx_vehicles_status_active" ON "vehicles"("status", "active");
CREATE INDEX IF NOT EXISTS "idx_inquiries_status" ON "inquiries"("status");
CREATE INDEX IF NOT EXISTS "idx_inquiries_vehicle_id" ON "inquiries"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_homepage_content_updated_at" ON "homepage_content"("updatedAt");
CREATE INDEX IF NOT EXISTS "idx_company_values_order_active" ON "company_values"("order", "active");
CREATE INDEX IF NOT EXISTS "idx_certifications_order_active" ON "certifications"("order", "active");
CREATE INDEX IF NOT EXISTS "idx_partners_order_active" ON "partners"("order", "active");
CREATE INDEX IF NOT EXISTS "idx_technology_features_order_active" ON "technology_features"("order", "active");

-- ===============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ===============================================================================

-- Add foreign key constraints with proper error handling
DO $$
BEGIN
    -- Sessions -> Users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sessions_userId_fkey'
    ) THEN
        ALTER TABLE "sessions" 
        ADD CONSTRAINT "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Vehicles -> Categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'vehicles_categoryId_fkey'
    ) THEN
        ALTER TABLE "vehicles" 
        ADD CONSTRAINT "vehicles_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Inquiries -> Vehicles
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inquiries_vehicleId_fkey'
    ) THEN
        ALTER TABLE "inquiries" 
        ADD CONSTRAINT "inquiries_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Inquiries -> Users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inquiries_userId_fkey'
    ) THEN
        ALTER TABLE "inquiries" 
        ADD CONSTRAINT "inquiries_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ===============================================================================
-- TRIGGER FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- ===============================================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
DROP TRIGGER IF EXISTS update_sessions_updated_at ON "sessions";
DROP TRIGGER IF EXISTS update_categories_updated_at ON "categories";
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON "vehicles";
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON "inquiries";
DROP TRIGGER IF EXISTS update_homepage_content_updated_at ON "homepage_content";
DROP TRIGGER IF EXISTS update_company_info_updated_at ON "company_info";
DROP TRIGGER IF EXISTS update_company_values_updated_at ON "company_values";
DROP TRIGGER IF EXISTS update_certifications_updated_at ON "certifications";
DROP TRIGGER IF EXISTS update_partners_updated_at ON "partners";
DROP TRIGGER IF EXISTS update_contact_info_updated_at ON "contact_info";
DROP TRIGGER IF EXISTS update_technology_content_updated_at ON "technology_content";
DROP TRIGGER IF EXISTS update_technology_features_updated_at ON "technology_features";

-- Recreate triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON "sessions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "vehicles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON "inquiries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_content_updated_at BEFORE UPDATE ON "homepage_content" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON "company_info" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_values_updated_at BEFORE UPDATE ON "company_values" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON "certifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON "partners" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON "contact_info" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technology_content_updated_at BEFORE UPDATE ON "technology_content" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technology_features_updated_at BEFORE UPDATE ON "technology_features" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================================================
-- INITIAL DATA SEEDING
-- ===============================================================================

-- Create default admin user (password: admin123)
-- Hash: $2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC
INSERT INTO "users" ("id", "email", "password", "role") 
VALUES (
    'admin_default_user',
    'admin@elitefleet.com',
    '$2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC',
    'ADMIN'
)
ON CONFLICT ("email") DO UPDATE SET
    "password" = '$2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC',
    "role" = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;

-- Create sample vehicle categories
INSERT INTO "categories" ("id", "name", "slug", "description", "active") VALUES
('cat_trucks', 'Trucks', 'trucks', 'Heavy-duty commercial trucks for logistics and transportation', true),
('cat_vans', 'Vans', 'vans', 'Commercial vans perfect for deliveries and small business operations', true),
('cat_buses', 'buses', 'Buses', 'buses', 'Passenger buses for public and private transportation services', true)
ON CONFLICT ("slug") DO NOTHING;

-- Create default content records
INSERT INTO "homepage_content" ("id") VALUES ('default_homepage') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "company_info" ("id") VALUES ('default_company') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "contact_info" ("id") VALUES ('default_contact') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "technology_content" ("id") VALUES ('default_technology') ON CONFLICT ("id") DO NOTHING;

-- Insert sample company values
INSERT INTO "company_values" ("id", "title", "description", "iconName", "order", "active") VALUES
('value_quality', 'Quality First', 'We never compromise on quality and ensure every vehicle meets the highest standards', 'Award', 1, true),
('value_reliability', 'Reliability', 'Our vehicles are built to last and perform consistently in demanding conditions', 'Shield', 2, true),
('value_service', 'Exceptional Service', 'Dedicated customer support and comprehensive after-sales service', 'Headphones', 3, true),
('value_innovation', 'Innovation', 'Embracing the latest technology to provide cutting-edge solutions', 'Lightbulb', 4, true)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample certifications
INSERT INTO "certifications" ("id", "name", "order", "active") VALUES
('cert_iso9001', 'ISO 9001:2015', 1, true),
('cert_iso14001', 'ISO 14001:2015', 2, true),
('cert_safety', 'Commercial Vehicle Safety Alliance', 3, true),
('cert_emissions', 'EPA Emissions Certified', 4, true)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample technology features
INSERT INTO "technology_features" ("id", "title", "description", "iconName", "order", "active") VALUES
('tech_battery', 'High-Capacity Battery', 'State-of-the-art lithium-ion battery technology with extended range capabilities', 'Battery', 1, true),
('tech_charging', 'Fast Charging', 'Rapid charging infrastructure supporting 80% charge in 30 minutes', 'Zap', 2, true),
('tech_fleet', 'Smart Fleet Management', 'AI-powered fleet management system for optimal route planning and vehicle monitoring', 'Smartphone', 3, true),
('tech_braking', 'Regenerative Braking', 'Energy recovery system that extends battery life and improves efficiency', 'RotateCcw', 4, true),
('tech_maintenance', 'Predictive Maintenance', 'Advanced diagnostics system that predicts maintenance needs before issues occur', 'Settings', 5, true),
('tech_emissions', 'Zero Emissions', 'Completely electric drivetrain producing zero direct emissions', 'Leaf', 6, true)
ON CONFLICT ("id") DO NOTHING;

-- ===============================================================================
-- VALIDATION AND SUCCESS MESSAGE
-- ===============================================================================

-- Validate that everything was created successfully
DO $$
BEGIN
    -- Check if all main tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        RAISE EXCEPTION 'Vehicles table was not created successfully';
    END IF;
    
    -- Check if admin user was created
    IF NOT EXISTS (SELECT 1 FROM "users" WHERE email = 'admin@elitefleet.com') THEN
        RAISE EXCEPTION 'Admin user was not created successfully';
    END IF;
    
    -- Check if categories were created
    IF (SELECT COUNT(*) FROM "categories") = 0 THEN
        RAISE EXCEPTION 'Sample categories were not created successfully';
    END IF;
END $$;

-- Final success message
SELECT 
    'Database setup completed successfully!' as status,
    'Tables created: ' || (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'users', 'sessions', 'categories', 'vehicles', 'inquiries',
            'homepage_content', 'company_info', 'company_values', 
            'certifications', 'partners', 'contact_info', 
            'technology_content', 'technology_features'
        )
    ) as tables_created,
    'Admin user: admin@elitefleet.com (password: admin123)' as admin_credentials,
    'Ready for Prisma: Run "npx prisma db pull" to sync schema' as next_step;

-- ===============================================================================
-- END OF SCRIPT
-- ===============================================================================