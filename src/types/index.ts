export interface Product {
  id: string;
  product_name: string;
  image_url: string;
  category: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
  productInterest: string;
}

export type Theme = 'light' | 'dark';