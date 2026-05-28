export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  price: number;
  stock_quantity: number;
  unit: string;
  created_at: string;
  updated_at: string | null;
  category?: Category;
}

export interface Transaction {
  id: number;
  product_id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  total_price: number;
  timestamp: string;
  created_at: string;
  updated_at: string | null;
  product?: Product;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Re-export as default for convenience
export type { Category as CategoryType };
export type { Product as ProductType };
export type { Transaction as TransactionType };
