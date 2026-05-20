-- Setup test portal user with provided UUID
-- Run these queries in Supabase SQL Editor

-- Step 1: Create test client company
INSERT INTO clients (company_name, contact_name, email, phone, website, address)
VALUES (
  'Test Company Inc',
  'Test Contact',
  'contact@testcompany.com',
  '+1-555-0100',
  'https://testcompany.com',
  '123 Test Street'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 2: Copy the client ID from Step 1 result, then run this:
-- Replace CLIENT_ID_HERE with the actual ID from Step 1
INSERT INTO client_users (
  email,
  full_name,
  user_id,
  client_id,
  status,
  approved_at
)
VALUES (
  'testuser@testcompany.com',
  'Test Portal User',
  '82331bd5-05d9-4920-8f99-702a7b21f989',
  'CLIENT_ID_HERE',
  'approved',
  NOW()
);

-- Verify it was created:
-- SELECT * FROM client_users WHERE user_id = '82331bd5-05d9-4920-8f99-702a7b21f989';
