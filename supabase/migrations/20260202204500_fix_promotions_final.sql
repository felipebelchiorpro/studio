-- 1. Ensure the position column exists
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'main_carousel';

-- 2. Clean up RLS policies to ensure no conflicts
DROP POLICY IF EXISTS "Public read promotions" ON public.promotions;
DROP POLICY IF EXISTS "Authenticated users can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Service Role manages promotions" ON public.promotions;

-- 3. Re-apply robust policies
-- Read: Everyone
CREATE POLICY "Public read promotions" ON public.promotions
    FOR SELECT TO public USING (true);

-- Manage: Authenticated (Admins) and Service Role
CREATE POLICY "Authenticated users can manage promotions" ON public.promotions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service Role manages promotions" ON public.promotions
    FOR ALL TO service_role USING (true) WITH CHECK (true);
