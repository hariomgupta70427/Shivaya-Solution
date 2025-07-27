export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  price?: number;
  image_url?: string;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
  // Additional fields
  brand?: string;
  series?: string;
  material?: string;
  features?: string;
  specifications?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  model?: string;
  sku?: string;
  product_name?: string; // For compatibility with the other Product interface
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  icon?: string;
} 