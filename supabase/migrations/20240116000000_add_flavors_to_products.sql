-- Add flavors column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS flavors text[] DEFAULT '{}';
