-- Add mobile_image_url column to promotions table
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

-- Update RLS if needed (usually covered by existing FOR ALL policies, but good to be safe)
-- The existing policies on 'promotions' should already cover this new column.
