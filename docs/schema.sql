-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  total_revenue NUMERIC
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, -- Utilizing the existing text IDs from mock data, or could use UUID
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category_id TEXT REFERENCES categories(id),
  brand TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  barcode TEXT,
  rating NUMERIC DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_new_release BOOLEAN DEFAULT FALSE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  author TEXT NOT NULL,
  rating INTEGER,
  comment TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
  channel TEXT
);

-- Order Items Table (Many-to-Many for Orders <-> Products)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT
);
