-- Migration: Add missing 'colors' column to products
-- This fixes the "Could not find the 'colors' column" error

ALTER TABLE "public"."products"
ADD COLUMN IF NOT EXISTS "colors" text[] NULL;
