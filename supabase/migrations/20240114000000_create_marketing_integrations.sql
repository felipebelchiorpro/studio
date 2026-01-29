-- Create table for Marketing Integrations settings
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_order_created TEXT,
    webhook_abandoned_cart TEXT,
    status_order_created BOOLEAN DEFAULT false,
    status_abandoned_cart BOOLEAN DEFAULT false,
    auth_token TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users (admins) to select
CREATE POLICY "Allow authenticated read" ON public.integration_settings
    FOR SELECT TO authenticated USING (true);

-- Policy: Allow all authenticated users (admins) to update
CREATE POLICY "Allow authenticated update" ON public.integration_settings
    FOR UPDATE TO authenticated USING (true);

-- Policy: Allow all authenticated users (admins) to insert
CREATE POLICY "Allow authenticated insert" ON public.integration_settings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Insert a default row if not exists (Singleton pattern)
INSERT INTO public.integration_settings (webhook_order_created, webhook_abandoned_cart, status_order_created, status_abandoned_cart, auth_token)
SELECT '', '', false, false, ''
WHERE NOT EXISTS (SELECT 1 FROM public.integration_settings);
