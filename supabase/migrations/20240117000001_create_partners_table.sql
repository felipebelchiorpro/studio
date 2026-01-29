-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_partners_code ON partners(code);

-- Add RLS policies (optional, but good practice)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (so we can validate codes publicly/anonymously if needed, or restrict to auth)
-- For now, allow public read to validate coupons
CREATE POLICY "Allow public read access" ON partners FOR SELECT USING (true);

-- Allow full access to authenticated admins (service role or specific admin logic would go here)
-- For simplicity in this demo, we'll allow authenticated users to do everything (assuming only admin logs in)
-- In a real app, you'd stricter policies.
CREATE POLICY "Allow all access to authenticated users" ON partners FOR ALL USING (auth.role() = 'authenticated');
