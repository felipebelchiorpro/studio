

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Preço original para mostrar desconto
  category: string;
  brand: string;
  imageUrl: string;
  stock: number;
  barcode?: string; // Added for barcode scanning
  reviews?: Review[];
  rating?: number; // Average rating
  isNewRelease?: boolean; // Para destacar novos produtos
  salesCount?: number; // For Top 5 Products

  // For dashboard stock page - transient property, not persisted ideally
  currentEditStock?: number;
}

export interface Review {
  id:string;
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
}

// Simple Brand type, could be expanded later if needed
export type Brand = string;

export interface CartItem extends Product {
  quantity: number;
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
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string; // e.g., link to a category or product
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

