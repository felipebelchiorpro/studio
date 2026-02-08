-- Add Mercado Pago columns to integration_settings table
ALTER TABLE integration_settings 
ADD COLUMN IF NOT EXISTS mp_access_token TEXT,
ADD COLUMN IF NOT EXISTS mp_public_key TEXT;
