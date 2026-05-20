ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS poster_url text;

NOTIFY pgrst, 'reload schema';
