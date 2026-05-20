
-- Replace the overly permissive bucket listing with a path-based read policy
DROP POLICY IF EXISTS "Media bucket public read" ON storage.objects;
CREATE POLICY "Media files publicly downloadable" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND (storage.foldername(name))[1] IS NOT NULL);

-- Validation trigger for public lead inserts
CREATE OR REPLACE FUNCTION public.validate_lead()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.name IS NULL OR length(trim(NEW.name)) = 0 OR length(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF NEW.email IS NULL OR NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR length(NEW.email) > 254 THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF NEW.message IS NULL OR length(trim(NEW.message)) = 0 OR length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;
  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 40 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_lead ON public.leads;
CREATE TRIGGER trg_validate_lead
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.validate_lead();
