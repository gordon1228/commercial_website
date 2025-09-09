-- Check if admin user exists
SELECT id, email, role, 
       CASE 
         WHEN password LIKE '$2b$%' THEN 'bcrypt hash (good)'
         ELSE 'invalid hash'
       END as password_status
FROM "users" 
WHERE "email" = 'admin@elitefleet.com';