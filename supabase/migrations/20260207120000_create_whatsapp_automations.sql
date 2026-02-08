-- Create whatsapp_automations table
CREATE TABLE IF NOT EXISTS whatsapp_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT UNIQUE NOT NULL, -- e.g. 'ORDER_CONFIRMED', 'ABANDONED_CART'
  name TEXT NOT NULL,
  description TEXT,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  delay_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_automations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or authenticated only, adjusting as per project norms)
-- Since this is for internal dashboard + n8n worker, we'll allow authenticated read/write
CREATE POLICY "Enable read access for authenticated users" ON whatsapp_automations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON whatsapp_automations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON whatsapp_automations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON whatsapp_automations FOR DELETE TO authenticated USING (true);

-- Also allow service_role (which n8n might use ultimately, or specific API key)
create policy "Enable all access for service_role" on whatsapp_automations for all to service_role using (true) with check (true);


-- Seed initial data
INSERT INTO whatsapp_automations (event_type, name, description, message_template, is_active, delay_minutes)
VALUES
  ('ORDER_CONFIRMED', 'Pedido Confirmado', 'Enviado assim que o pagamento é aprovado.', 'Olá {{customer_name}}, seu pedido #{{order_id}} foi confirmado! Obrigado pela compra.', TRUE, 0),
  ('ORDER_SHIPPED', 'Pedido Enviado', 'Enviado quando o pedido sai para entrega.', 'Olá {{customer_name}}, boas notícias! Seu pedido #{{order_id}} já foi enviado. Acompanhe a entrega: {{tracking_link}}', TRUE, 0),
  ('ABANDONED_CART', 'Carrinho Abandonado', 'Recuperação de carrinho após X minutos.', 'Oi {{customer_name}}, notamos que você deixou alguns itens no carrinho. Que tal finalizar sua compra agora? Volte aqui: {{checkout_url}}', TRUE, 15)
ON CONFLICT (event_type) DO NOTHING;
