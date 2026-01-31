-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Integration Settings (Marketing)
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_order_created TEXT,
    webhook_abandoned_cart TEXT,
    status_order_created BOOLEAN DEFAULT false,
    status_abandoned_cart BOOLEAN DEFAULT false,
    auth_token TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
INSERT INTO public.integration_settings (webhook_order_created, webhook_abandoned_cart, status_order_created, status_abandoned_cart, auth_token)
SELECT '', '', false, false, ''
WHERE NOT EXISTS (SELECT 1 FROM public.integration_settings);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  total_revenue NUMERIC DEFAULT 0,
  parent_id TEXT REFERENCES categories(id),
  type TEXT DEFAULT 'supplement' -- supplement, clothing
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category_id TEXT REFERENCES categories(id),
  brand TEXT,
  image_url TEXT,
  hover_image_url TEXT, -- Added
  stock INTEGER DEFAULT 0,
  barcode TEXT,
  rating NUMERIC DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_new_release BOOLEAN DEFAULT FALSE,
  flavors text[] DEFAULT '{}',
  weights text[] DEFAULT '{}',
  gallery text[] DEFAULT '{}',
  color_mapping jsonb DEFAULT '[]'::jsonb
);

-- 4. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  author TEXT NOT NULL,
  rating INTEGER,
  comment TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Carts
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    user_phone TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
  channel TEXT
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL
);

-- 8. Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT
);

-- 9. Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL,
  expiration_date TIMESTAMPTZ,
  usage_limit INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_count INTEGER DEFAULT 0,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);
CREATE INDEX IF NOT EXISTS idx_coupons_partner_id ON coupons(partner_id);

-- Enable RLS (Security Policies)
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Basic Public Policies (Simulating open access for store functionality)
-- NOTE: In production, you might want to restrict these further.
CREATE POLICY "Public Read Settings" ON public.integration_settings FOR SELECT USING (true);
CREATE POLICY "Public Carts Access" ON public.carts FOR ALL USING (true);
CREATE POLICY "Public Coupons Read" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public Partners Read" ON partners FOR SELECT USING (true);
