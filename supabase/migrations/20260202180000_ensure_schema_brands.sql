-- RESTORE SCHEMA: Brands & Storage
-- Run this if you are on a NEW database and tables are missing.

-- 1. Create BRANDS Table (if missing)
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL
);

-- 2. Enable RLS on Brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. Brands Policies
DROP POLICY IF EXISTS "Public read brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated insert brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated update brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated delete brands" ON public.brands;
-- Also drop policies with other names if they exist from previous attempts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brands;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.brands;

CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Authenticated insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update brands" ON public.brands FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete brands" ON public.brands FOR DELETE TO authenticated USING (true);


-- 4. Storage Buckets (Ensuring they exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 52428800, '{"image/png","image/jpeg","image/webp","image/gif","image/jpg"}')
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-logos', 'brand-logos', true, 52428800, '{"image/png","image/jpeg","image/webp","image/gif","image/jpg"}')
ON CONFLICT (id) DO UPDATE SET public = true;


-- 5. Storage Policies (Robust)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'brand-logos'));
CREATE POLICY "Authenticated Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('products', 'brand-logos'));
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('products', 'brand-logos'));
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('products', 'brand-logos'));

-- 6. Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON TABLE public.brands TO authenticated;
GRANT SELECT ON TABLE public.brands TO anon;
-- GRANT ALL ON SEQUENCE public.brands_id_seq TO authenticated; (Removed: UUID doesn't use sequence)
