-- Create shipping_rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT UNIQUE NOT NULL,
  base_fee NUMERIC NOT NULL,
  estimated_delivery_time TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial data
INSERT INTO shipping_rates (city_name, base_fee, estimated_delivery_time, is_active)
VALUES
  ('Caconde', 5.00, '40-60 min', TRUE),
  ('Tapiratiba', 15.00, '60-90 min', TRUE),
  ('Divinolândia', 15.00, '60-90 min', TRUE)
ON CONFLICT (city_name) DO UPDATE SET
  base_fee = EXCLUDED.base_fee,
  estimated_delivery_time = EXCLUDED.estimated_delivery_time;

-- Enable RLS
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checkout)
CREATE POLICY "Public shipping rates are viewable" ON shipping_rates FOR SELECT USING (true);

-- Allow authenticated/service role full access (for admin)
CREATE POLICY "Enable all access for authenticated users" ON shipping_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for service role" ON shipping_rates FOR ALL TO service_role USING (true) WITH CHECK (true);
