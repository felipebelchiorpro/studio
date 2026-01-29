-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL,
  expiration_date TIMESTAMPTZ,
  usage_limit INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_count INTEGER DEFAULT 0
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- RLS Policies (Optional but recommended)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to validate coupons
CREATE POLICY "Public coupons are viewable" ON coupons FOR SELECT USING (true);

-- Allow service role full access (implicitly true, but explicit doesn't hurt)
-- Note: Service role bypasses RLS anyway.
