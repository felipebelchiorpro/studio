-- Add flavor_mapping column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS flavor_mapping JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN products.flavor_mapping IS 'Stores mapping of flavor names to image URLs';
