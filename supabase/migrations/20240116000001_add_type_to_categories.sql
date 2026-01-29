-- Add type column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS type text DEFAULT 'supplement'; -- 'supplement', 'clothing'
