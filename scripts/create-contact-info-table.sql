-- Create contact_info table if it doesn't exist
-- This can be run directly in your database console if needed

CREATE TABLE IF NOT EXISTS "public"."contact_info" (
    "id" TEXT NOT NULL,
    "salesPhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    "servicePhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4568',
    "financePhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4569',
    "salesEmail" TEXT NOT NULL DEFAULT 'sales@evtl.com',
    "serviceEmail" TEXT NOT NULL DEFAULT 'service@evtl.com',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@evtl.com',
    "address" TEXT NOT NULL DEFAULT '123 Business Avenue',
    "city" TEXT NOT NULL DEFAULT 'Commercial District, NY 10001',
    "directions" TEXT NOT NULL DEFAULT 'Near Metro Station',
    "mondayToFriday" TEXT NOT NULL DEFAULT '8:00 AM - 6:00 PM',
    "saturday" TEXT NOT NULL DEFAULT '9:00 AM - 4:00 PM',
    "sunday" TEXT NOT NULL DEFAULT 'Closed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- Insert default data if table is empty
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