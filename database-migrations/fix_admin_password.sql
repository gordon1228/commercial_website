-- Fix admin user password with proper bcrypt hash
-- Run this in Supabase SQL Editor

-- Update the admin user with a properly hashed password
-- Password will be: admin123
UPDATE "users" 
SET "password" = '$2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC'
WHERE "email" = 'admin@elitefleet.com';

-- If the user doesn't exist, create it
INSERT INTO "users" ("id", "email", "password", "role", "updatedAt") 
VALUES (
    'admin123user456',
    'admin@elitefleet.com',
    '$2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC',
    'ADMIN',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
    "password" = '$2b$10$haY5olp/wh4hgR4SP69hXO4MTA5uRJz4Fw1xqlqn41b7LNAJQ3QUC',
    "role" = 'ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;

SELECT 'Admin password updated successfully!' as message;