CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL,
  role text,
  active boolean DEFAULT true NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public testimonials are viewable by everyone."
ON testimonials FOR SELECT USING (active = true);

-- Allow authenticated admins to do everything
CREATE POLICY "Admins can manage testimonials."
ON testimonials FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Insert initial hardcoded data
INSERT INTO testimonials (quote, name, role, display_order) VALUES
('ASLENIX rebuilt our entire platform in 8 weeks. The design is breathtaking and our conversions doubled within a month.', 'Aarav Sharma', 'CEO, Lumora SaaS', 0),
('Working with ASLENIX feels like having a senior in-house team. They care about the details and ship on time, every time.', 'Priya Khadka', 'Founder, Bloom Co.', 1),
('The AI assistant they built handles 70% of our support queries. ROI was clear within the first quarter.', 'Daniel Wright', 'Head of Ops, Northwind', 2);
