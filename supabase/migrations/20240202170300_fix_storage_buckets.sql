-- Fix Storage Buckets and Permissions

-- 1. Ensure buckets exist and are public
-- Products Bucket (50MB limit, images/videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 52428800, '{"image/png","image/jpeg","image/webp","image/gif","image/jpg"}')
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- Brand Logos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-logos', 'brand-logos', true, 52428800, '{"image/png","image/jpeg","image/webp","image/gif","image/jpg"}')
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to prevent conflicts/duplicates/confusion
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public select images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Create robust policies
-- Read: Everyone (Public)
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id IN ('products', 'brand-logos'));

-- Write (Insert/Update/Delete): Authenticated Users
CREATE POLICY "Authenticated Insert" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id IN ('products', 'brand-logos'));

CREATE POLICY "Authenticated Update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id IN ('products', 'brand-logos'));

CREATE POLICY "Authenticated Delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id IN ('products', 'brand-logos'));
