-- Add partner_id to coupons table
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_partner_id ON coupons(partner_id);
