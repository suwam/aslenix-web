ALTER TABLE public.homepage_content
ADD COLUMN IF NOT EXISTS hero_slides JSONB;
