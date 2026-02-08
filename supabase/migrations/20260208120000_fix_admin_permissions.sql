
-- 1. Enable full access for Authenticated Users on Coupons
DROP POLICY IF EXISTS "Service Role manages coupons" ON coupons;
DROP POLICY IF EXISTS "Public read coupons" ON coupons;

CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Enable full access for Authenticated Users on Shipping Rates (Re-apply to be safe)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON shipping_rates;
CREATE POLICY "Enable all access for authenticated users" ON shipping_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Enable full access for Authenticated Users on Partners
DROP POLICY IF EXISTS "Service Role manages partners" ON partners;
DROP POLICY IF EXISTS "Public read partners" ON partners;

CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage partners" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Enable full access for Authenticated Users on Products (Just in case)
DROP POLICY IF EXISTS "Service Role manages products" ON products;
CREATE POLICY "Authenticated users manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service Role manages products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Enable full access for Authenticated Users on Categories
DROP POLICY IF EXISTS "Service Role manages categories" ON categories;
CREATE POLICY "Authenticated users manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service Role manages categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
