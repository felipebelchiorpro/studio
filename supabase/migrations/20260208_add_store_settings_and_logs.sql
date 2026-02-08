
-- Add store settings to integration_settings
ALTER TABLE integration_settings
ADD COLUMN IF NOT EXISTS store_address TEXT,
ADD COLUMN IF NOT EXISTS store_hours TEXT;

-- Create order_notifications table for history log
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for order_notifications
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access
CREATE POLICY "Service Role manages notifications" ON order_notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow Admin (via Anon/Public for now due to auth workaround) to insert/read
CREATE POLICY "Public read/write notifications" ON order_notifications
    FOR ALL USING (true) WITH CHECK (true);
