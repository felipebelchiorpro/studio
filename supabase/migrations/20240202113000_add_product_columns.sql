-- Migration: Add missing 'sizes' and other potential missing columns
-- Fixes "Could not find the 'sizes' column"

-- 1. Sizes (The current error)
ALTER TABLE "public"."products"
ADD COLUMN IF NOT EXISTS "sizes" text[] DEFAULT '{}';

-- 2. Potential missing Pro features (Just to be safe)
ALTER TABLE "public"."products"
ADD COLUMN IF NOT EXISTS "video_url" text NULL,
ADD COLUMN IF NOT EXISTS "original_price" numeric NULL,
ADD COLUMN IF NOT EXISTS "is_new_release" boolean DEFAULT false;

-- 3. Handling Case Sensitivity/Mapping
-- If the frontend sends "originalPrice" (camelCase) but DB has "original_price" (snake_case), it might fail.
-- For now, let's ensure the snake_case columns exist. 
-- *If* you still get errors about "originalPrice" (missing), we can add an alias or fix the frontend code.
