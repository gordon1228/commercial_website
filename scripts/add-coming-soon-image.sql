-- Add comingSoonImage field to homepage_content table
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS "comingSoonImage" TEXT DEFAULT '/uploads/Technology_background.png';