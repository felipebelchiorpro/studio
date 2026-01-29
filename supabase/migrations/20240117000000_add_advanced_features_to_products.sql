-- Migration: Add advanced product features (Weights, Gallery, Color Mapping)

ALTER TABLE "public"."products"
ADD COLUMN "weights" text[] NULL,
ADD COLUMN "gallery" text[] NULL,
ADD COLUMN "color_mapping" jsonb NULL; -- Stores array of { color, hex, image } objects
