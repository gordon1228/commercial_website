-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.technology_content CASCADE;
DROP TABLE IF EXISTS public.technology_features CASCADE;

-- Create technology_content table with camelCase columns (matching Prisma schema)
CREATE TABLE public.technology_content (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create technology_features table with camelCase columns (matching Prisma schema)
CREATE TABLE public.technology_features (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Zap',
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for technology_features
CREATE INDEX idx_technology_features_order_active ON public.technology_features("order", active);

-- Insert default technology content with camelCase column names
INSERT INTO public.technology_content (
    id,
    "heroTitle",
    "heroSubtitle",
    "heroBackgroundImage",
    "heroBackgroundImageAlt",
    "section1Title",
    "section1Description",
    "section2Title",
    "section2Description",
    "section3Title",
    "section3Description",
    "section4Title",
    "section4Description"
) VALUES (
    gen_random_uuid()::text,
    'Next-Generation Electric Truck Technology',
    'Advanced electric vehicle technology designed for commercial success and environmental sustainability',
    '/uploads/Technology_background.png',
    'Electric Truck Technology Background',
    'Advanced Battery Technology',
    'Our cutting-edge battery systems provide exceptional range and durability for commercial applications.',
    'Smart Fleet Management',
    'Integrated IoT solutions for real-time monitoring, maintenance prediction, and route optimization.',
    'Rapid Charging Infrastructure',
    'Fast-charging capabilities designed to minimize downtime and maximize operational efficiency.',
    'Sustainable Manufacturing',
    'Eco-friendly production processes that reduce environmental impact while maintaining quality.'
);

-- Insert sample technology features with camelCase column names
INSERT INTO public.technology_features (title, description, "iconName", "order", active) VALUES
('High-Capacity Battery', 'State-of-the-art lithium-ion battery technology with extended range capabilities', 'Battery', 1, true),
('Fast Charging', 'Rapid charging infrastructure supporting 80% charge in 30 minutes', 'Zap', 2, true),
('Smart Fleet Management', 'AI-powered fleet management system for optimal route planning and vehicle monitoring', 'Smartphone', 3, true),
('Regenerative Braking', 'Energy recovery system that extends battery life and improves efficiency', 'RotateCcw', 4, true),
('Predictive Maintenance', 'Advanced diagnostics system that predicts maintenance needs before issues occur', 'Settings', 5, true),
('Zero Emissions', 'Completely electric drivetrain producing zero direct emissions', 'Leaf', 6, true);