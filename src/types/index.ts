


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Preço original para mostrar desconto
  category: string;
  categoryId?: string; // Added for linking to backend
  brand: string;
  imageUrl: string;
  hoverImageUrl?: string; // Image to show on hover
  stock: number;
  barcode?: string; // Added for barcode scanning
  reviews?: Review[];
  rating?: number; // Average rating
  isNewRelease?: boolean; // Para destacar novos produtos
  salesCount?: number; // For Top 5 Products

  // Variations (Mock/Future visuals)
  colors?: string[];
  sizes?: string[];
  flavors?: string[];

  // Advanced Features (Pro)
  weights?: string[];
  gallery?: string[];
  colorMapping?: Array<{ color: string; hex: string; image?: string; images?: string[] }>;
  flavorMapping?: Array<{ flavor: string; image?: string }>; // Added for Flavor Images

  // For dashboard stock page - transient property, not persisted ideally
  currentEditStock?: number;
}

export interface Partner {
  id: string;
  name: string;
  code: string;
  score: number;
  created_at: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string; // Optional: for category banners
  totalRevenue?: number; // For Top 5 Categories
  parentId?: string;
  type?: 'supplement' | 'clothing' | 'other'; // Added type
  children?: Category[];
}

// Simple Brand type, could be expanded later if needed
// Brand type with image support
export interface Brand {
  id: string;
  name: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
  couponCode?: string; // Track applied coupon
}

export interface User {
  id: string;
  email: string;
  name?: string;
  // For simulated auth, no password stored
}

// Customer specific user type, can be expanded later
export interface CustomerUser extends User {
  // Add customer-specific fields here if needed in the future
  // e.g., defaultShippingAddressId?: string;
  registeredAt?: string; // Added for customer management
  phone?: string; // Added for contact info
}


// Original Order type for sales reports, etc.
export interface Order {
  id: string;
  userId: string; // Could be CustomerUser.id
  items: CartItem[]; // These are CartItems, which include full product details + quantity bought
  totalAmount: number;
  orderDate: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: string; // Simplified
  channel?: string; // Added for BI Dashboard
  userPhone?: string; // Added for WhatsApp Integration
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string; // e.g., link to a category or product
  position?: 'main_carousel' | 'grid_left' | 'grid_top_right' | 'grid_bottom_left' | 'grid_bottom_right';
}

export interface DropdownCategory {
  id: string;
  name: string;
  href?: string;
  hasSubmenu?: boolean;
  subItems?: Array<{ id: string; name: string; href: string }>;
}

// Types for Packing Station
export interface PackingOrderItem {
  productId: string;
  name: string;
  sku?: string; // Or use product.id if SKU isn't a separate field
  barcode: string;
  imageUrl: string;
  expectedQuantity: number;
  packedQuantity: number;
}

export interface PackingOrder {
  orderId: string; // This could be the scannable barcode for the whole order
  customerName?: string; // Optional, for display
  items: PackingOrderItem[];
  targetWeight?: number; // For future weight validation feature
}

// Types for BI Dashboard
export interface BiCategoryFilterItem {
  id: string;
  name: string;
}
export interface BiSalesChannelFilterItem {
  id: string;
  name: string;
}
export interface BiGeoFilterItem {
  id: string; // e.g., 'SP', 'RJ'
  name: string; // e.g., 'São Paulo', 'Rio de Janeiro'
}



