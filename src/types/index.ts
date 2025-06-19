

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Added for discount display
  category: string;
  brand: string;
  imageUrl: string;
  stock: number;
  reviews?: Review[];
  rating?: number; // Average rating
  isNewRelease?: boolean; // Added for new releases
  salesCount?: number; // For Top 5 Products
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

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  // For simulated auth, no password stored
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
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

