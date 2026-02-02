
-- Add partner_name column to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS partner_name TEXT;
