-- Ensure the canonical admin user exists with the requested initial password.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET
  encrypted_password = extensions.crypt('aslenix3212', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'info.aslenix.np@gmail.com';

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'info.aslenix.np@gmail.com', extensions.crypt('aslenix3212', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false,
  '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'info.aslenix.np@gmail.com'
);

INSERT INTO public.profiles (id, email, display_name)
SELECT id, email, email
FROM auth.users
WHERE email = 'info.aslenix.np@gmail.com'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'info.aslenix.np@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
