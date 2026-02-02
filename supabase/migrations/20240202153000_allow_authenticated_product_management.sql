-- Migration: Allow Authenticated Users to Manage Products
-- Previously only Service Role could do this. Now Dashboard is Client-Side.

-- PRODUCTS
CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products" ON public.products
    FOR DELETE TO authenticated USING (true);

-- Also fix CATEGORIES just in case
CREATE POLICY "Authenticated users can insert categories" ON public.categories
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON public.categories
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories" ON public.categories
    FOR DELETE TO authenticated USING (true);
