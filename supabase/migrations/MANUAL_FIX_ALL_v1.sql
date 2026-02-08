
-- MANUAL FIX SCRIPT (v1)
-- Run this in your Supabase Dashboard > SQL Editor to fix all database errors.

-- 1. FIX COUPONS SCHEMA (Add missing column)
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS partner_name TEXT;

-- 2. CREATE SHIPPING RATES TABLE (If missing)
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT UNIQUE NOT NULL,
  base_fee NUMERIC NOT NULL,
  estimated_delivery_time TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Shipping Data (updates if exists)
INSERT INTO shipping_rates (city_name, base_fee, estimated_delivery_time, is_active)
VALUES
  ('Caconde', 5.00, '40-60 min', TRUE),
  ('Tapiratiba', 15.00, '60-90 min', TRUE),
  ('Divinolândia', 15.00, '60-90 min', TRUE)
ON CONFLICT (city_name) DO UPDATE SET
  base_fee = EXCLUDED.base_fee,
  estimated_delivery_time = EXCLUDED.estimated_delivery_time;


-- 3. FIX PERMISSIONS (Allow YOU, the logged-in user, to edit data)

-- Coupons Permissions
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage coupons" ON coupons;
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipping Rates Permissions
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON shipping_rates;
DROP POLICY IF EXISTS "Public shipping rates are viewable" ON shipping_rates;
CREATE POLICY "Public shipping rates are viewable" ON shipping_rates FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON shipping_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Partners Permissions
ALTER TABLE IF EXISTS partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage partners" ON partners;
DROP POLICY IF EXISTS "Public read partners" ON partners;
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage partners" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products & Categories Permissions (Cleanup)
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage products" ON products;
CREATE POLICY "Authenticated users manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage categories" ON categories;
CREATE POLICY "Authenticated users manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
