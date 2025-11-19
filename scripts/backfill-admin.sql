-- Backfill admin role for the primary user
-- Update with your actual handle or email

-- Option 1: By handle (replace 'yourusername' with actual handle)
-- UPDATE "User" SET role = 'ADMIN' WHERE handle = 'yourusername';

-- Option 2: By email (replace with actual email)
-- UPDATE "User" SET role = 'ADMIN' WHERE email = 'your.email@example.com';

-- Option 3: Make the first user admin
UPDATE "User" SET role = 'ADMIN' 
WHERE id = (SELECT id FROM "User" ORDER BY "createdAt" LIMIT 1);

-- Verify admin user
SELECT id, handle, email, role FROM "User" WHERE role = 'ADMIN';
