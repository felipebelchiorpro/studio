-- Create table for tracking Carts
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT, -- We need this to contact the user
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open', 'abandoned', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read everything (Cron needs this)
CREATE POLICY "Allow service role read" ON public.carts
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow service role update" ON public.carts
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Allow service role insert" ON public.carts
    FOR INSERT TO service_role WITH CHECK (true);

-- For guest users, we might want to allow public insert/update based on some session ID
-- keeping it strict for now, assuming server-side interaction
