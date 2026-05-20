-- Reset admin password and ensure email is confirmed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users 
SET 
  encrypted_password = extensions.crypt('aslenix3212', extensions.gen_salt('bf')), 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'info.aslenix.np@gmail.com';

-- If admin user does not exist, create them
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'info.aslenix.np@gmail.com', extensions.crypt('aslenix3212', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'info.aslenix.np@gmail.com');
