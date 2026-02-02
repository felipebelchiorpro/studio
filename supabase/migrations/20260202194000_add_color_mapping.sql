
-- Add color_mapping column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_mapping JSONB;
