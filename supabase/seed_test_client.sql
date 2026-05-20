-- Seed script: Create test client and portal user
-- Run this in Supabase SQL Editor

-- 1. Create a test client company
INSERT INTO clients (company_name, contact_name, email, phone, website, address, notes, active)
VALUES (
  'Test Company Inc',
  'John Doe',
  'john@testcompany.com',
  '+1-555-0100',
  'https://testcompany.com',
  '123 Test Street, Test City',
  'Test client for portal messaging',
  true
) ON CONFLICT DO NOTHING;

-- 2. Get the client ID (run this separately to see the ID)
-- SELECT id FROM clients WHERE company_name = 'Test Company Inc' LIMIT 1;

-- 3. Create a test portal user (you need to replace CLIENT_ID with actual ID from step 2)
-- First, create the auth user via Supabase Auth UI, then run this:
-- INSERT INTO client_users (email, full_name, user_id, client_id, status, approved_at)
-- VALUES (
--   'testuser@testcompany.com',
--   'Test Portal User',
--   'USER_ID_FROM_AUTH', -- Replace with actual UUID from auth.users
--   'CLIENT_ID_HERE',    -- Replace with client ID from step 2
--   'approved',
--   NOW()
-- );

-- IMPORTANT STEPS:
-- 1. Copy and run lines 4-14 to create the test company
-- 2. Then go to Supabase Auth → Users and create a new user with email: testuser@testcompany.com
-- 3. Copy the user ID (UUID) from the auth user
-- 4. Replace USER_ID_FROM_AUTH in the client_users INSERT with that UUID
-- 5. Get the client ID from step 1 and replace CLIENT_ID_HERE
-- 6. Run the client_users INSERT statement
