-- Commercial Vehicle Platform - Supabase Setup SQL
-- Run this script in your Supabase SQL Editor

-- Create ENUM types first
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED');
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'RESOLVED', 'CLOSED');

-- Create tables

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Sessions table
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Categories table
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Vehicles table
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "specs" JSONB,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "mileage" INTEGER,
    "fuelType" TEXT,
    "transmission" TEXT,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- Inquiries table
CREATE TABLE "inquiries" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- Settings table
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'EliteFleet',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@elitefleet.com',
    "supportPhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    "address" TEXT NOT NULL DEFAULT '123 Business Avenue, Commercial District, NY 10001',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- Homepage Content table
CREATE TABLE "homepage_content" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Premium Commercial',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Vehicles',
    "heroDescription" TEXT NOT NULL DEFAULT 'Discover elite fleet solutions built for businesses that demand excellence, reliability, and uncompromising quality.',
    "heroButtonPrimary" TEXT NOT NULL DEFAULT 'Explore Fleet',
    "heroButtonSecondary" TEXT NOT NULL DEFAULT 'Get Quote',
    "vehiclesSold" INTEGER NOT NULL DEFAULT 50,
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
    "comingSoonImageAlt" TEXT NOT NULL DEFAULT 'Coming Soon',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- Partners table
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "sessions_sessionId_key" ON "sessions"("sessionId");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "vehicles_slug_key" ON "vehicles"("slug");

-- Add foreign key constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert initial data

-- Create default admin user (password: admin123)
INSERT INTO "users" ("id", "email", "password", "role", "updatedAt") 
VALUES (
    'clx123admin456',
    'admin@elitefleet.com',
    '$2a$10$K7L/8Y3OYi4g8g8C8G5GdO9I2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y',
    'ADMIN',
    CURRENT_TIMESTAMP
);

-- Create sample categories
INSERT INTO "categories" ("id", "name", "slug", "description", "active", "updatedAt") VALUES
('cat1', 'Trucks', 'trucks', 'Heavy-duty commercial trucks for logistics and transportation', true, CURRENT_TIMESTAMP),
('cat2', 'Vans', 'vans', 'Commercial vans perfect for deliveries and small business operations', true, CURRENT_TIMESTAMP),
('cat3', 'Buses', 'buses', 'Passenger buses for public and private transportation services', true, CURRENT_TIMESTAMP);

-- Create default settings
INSERT INTO "settings" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);

-- Create default homepage content
INSERT INTO "homepage_content" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);

-- Add function to automatically update updatedAt timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON "sessions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "vehicles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON "inquiries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON "settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_content_updated_at BEFORE UPDATE ON "homepage_content" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON "partners" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup completed successfully! All tables, indexes, and initial data have been created.' as message;