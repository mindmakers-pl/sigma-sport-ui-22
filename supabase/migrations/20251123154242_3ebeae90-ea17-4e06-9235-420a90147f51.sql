-- Create trainers table for admin panel
CREATE TABLE IF NOT EXISTS public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'trainer' CHECK (role IN ('admin', 'trainer', 'coach')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (temporary, will be replaced with auth)
CREATE POLICY "Allow anon to view trainers"
  ON public.trainers
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anon to insert trainers"
  ON public.trainers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon to update trainers"
  ON public.trainers
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow anon to delete trainers"
  ON public.trainers
  FOR DELETE
  USING (true);

-- Seed Iwan's admin account
INSERT INTO public.trainers (email, name, role) 
VALUES ('iwan.nylypiuk@mindmakers.pl', 'Iwan Nylypiuk', 'admin')
ON CONFLICT (email) DO NOTHING;