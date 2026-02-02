
-- 1. Create banners bucket for stored marketing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banners', 'banners', true, 52428800, '{"image/png","image/jpeg","image/webp","image/gif","image/jpg"}')
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for Banners
CREATE POLICY "Public Access Banners" ON storage.objects 
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated Insert Banners" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Authenticated Update Banners" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id = 'banners');

CREATE POLICY "Authenticated Delete Banners" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'banners');

-- 3. PROMOTIONS Table Fix (Allow Authenticated Management)
-- First ensure table exists (safety)
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    position TEXT DEFAULT 'main_carousel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Drop existings to avoid conflicts
DROP POLICY IF EXISTS "Public read promotions" ON public.promotions;
DROP POLICY IF EXISTS "Authenticated users can manage promotions" ON public.promotions;

CREATE POLICY "Public read promotions" ON public.promotions
    FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage promotions" ON public.promotions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
