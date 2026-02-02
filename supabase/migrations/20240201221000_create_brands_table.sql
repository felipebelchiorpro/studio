-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "imageUrl" TEXT NOT NULL  -- Quoted mixed case to match frontend interface if needed, but standard SQL prefers snake_case.
                            -- Frontend uses imageUrl. Supabase maps snake_case auto, but let's stick to standard snake_case "image_url" in DB and map it, OR use quotes.
                            -- Let's use standard snake_case "image_url" and Map in the code.
);

-- Actually, simpler: Use quoted identity to match frontend exact props? 
-- No, better practice is snake_case in DB.
-- "image_url" in DB.

ALTER TABLE public.brands DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS image_url TEXT;

-- RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read brands" ON public.brands
    FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated insert brands" ON public.brands
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated delete brands" ON public.brands
    FOR DELETE TO authenticated USING (true);

-- Fix previous possible mixed case
-- (If you ran this multiple times)
