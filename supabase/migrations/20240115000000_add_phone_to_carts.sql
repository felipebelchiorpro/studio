-- Add user_phone column to carts table
ALTER TABLE public.carts 
ADD COLUMN IF NOT EXISTS user_phone TEXT;
