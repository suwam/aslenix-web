-- Add new columns for floating review submissions
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating integer DEFAULT 5;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS email text;

-- Allow public visitors to submit reviews securely
-- We check for the policy existence to prevent errors if run multiple times
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'testimonials' 
        AND policyname = 'Anyone can submit a testimonial.'
    ) THEN
        CREATE POLICY "Anyone can submit a testimonial."
        ON testimonials FOR INSERT WITH CHECK (true);
    END IF;
END
$$;
