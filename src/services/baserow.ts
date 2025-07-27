import { Product } from '../types/product';

// Baserow API configuration with fallback values for development
const baserowConfig = {
  apiUrl: import.meta.env.VITE_BASEROW_API_URL || 'https://api.baserow.io',
  apiKey: import.meta.env.VITE_BASEROW_API_KEY || 'placeholder_key',
  tableId: import.meta.env.VITE_BASEROW_TABLE_ID || '1',
};

// Check if Baserow is properly configured
const isBaserowConfigured = () => {
  return baserowConfig.apiKey !== 'placeholder_key' && baserowConfig.tableId !== '1';
};

// Type for Baserow API response
interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Type for Baserow error
interface BaserowError {
  error: string;
  detail?: string;
}

// Helper function to check if response is an error
function isBaserowError(response: any): response is BaserowError {
  return response && response.error !== undefined;
}

// Get all products from Baserow
export async function getProducts(): Promise<Product[]> {
  if (!isBaserowConfigured()) {
    console.warn('Baserow not configured. Returning mock data.');
    return getMockProducts();
  }

  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${baserowConfig.tableId}/?user_field_names=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch products');
    }

    const data = await response.json() as BaserowResponse<Product>;
    return data.results;
  } catch (error) {
    console.error('Error fetching products:', error);
    return getMockProducts();
  }
}

// Create a new product in Baserow
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (!isBaserowConfigured()) {
    throw new Error('Baserow not configured. Please set up your environment variables.');
  }

  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${baserowConfig.tableId}/?user_field_names=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create product');
    }

    const data = await response.json();
    return data as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update an existing product in Baserow
export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  if (!isBaserowConfigured()) {
    throw new Error('Baserow not configured. Please set up your environment variables.');
  }

  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${baserowConfig.tableId}/${id}/?user_field_names=true`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update product');
    }

    const data = await response.json();
    return data as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete a product from Baserow
export async function deleteProduct(id: number): Promise<void> {
  if (!isBaserowConfigured()) {
    throw new Error('Baserow not configured. Please set up your environment variables.');
  }

  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${baserowConfig.tableId}/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Get categories from Baserow (if categories are in a separate table)
export async function getCategories(): Promise<any[]> {
  // If categories are in a separate table, implement this
  const categoryTableId = import.meta.env.VITE_BASEROW_CATEGORY_TABLE_ID;
  
  if (!isBaserowConfigured() || !categoryTableId) {
    console.warn('Baserow categories not configured. Returning mock data.');
    return getMockCategories();
  }
  
  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${categoryTableId}/?user_field_names=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch categories');
    }

    const data = await response.json() as BaserowResponse<any>;
    return data.results;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return getMockCategories();
  }
}

// Create a new category in Baserow
export async function createCategory(category: any): Promise<any> {
  const categoryTableId = import.meta.env.VITE_BASEROW_CATEGORY_TABLE_ID;
  
  if (!isBaserowConfigured() || !categoryTableId) {
    throw new Error('Baserow categories not configured. Please set up your environment variables.');
  }
  
  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${categoryTableId}/?user_field_names=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create category');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Update an existing category in Baserow
export async function updateCategory(id: number, category: any): Promise<any> {
  const categoryTableId = import.meta.env.VITE_BASEROW_CATEGORY_TABLE_ID;
  
  if (!isBaserowConfigured() || !categoryTableId) {
    throw new Error('Baserow categories not configured. Please set up your environment variables.');
  }
  
  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${categoryTableId}/${id}/?user_field_names=true`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update category');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

// Delete a category from Baserow
export async function deleteCategory(id: number): Promise<void> {
  const categoryTableId = import.meta.env.VITE_BASEROW_CATEGORY_TABLE_ID;
  
  if (!isBaserowConfigured() || !categoryTableId) {
    throw new Error('Baserow categories not configured. Please set up your environment variables.');
  }
  
  try {
    const response = await fetch(`${baserowConfig.apiUrl}/database/rows/table/${categoryTableId}/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${baserowConfig.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Mock data for development
function getMockProducts(): Product[] {
  return [
    {
      id: 1,
      name: 'Sample Product 1',
      category: 'Plasticware',
      description: 'This is a sample product for development',
      price: 199,
      image_url: 'https://via.placeholder.com/150',
      in_stock: true,
    },
    {
      id: 2,
      name: 'Sample Product 2',
      category: 'Kitchenware',
      description: 'Another sample product for development',
      price: 299,
      image_url: 'https://via.placeholder.com/150',
      in_stock: true,
    },
    {
      id: 3,
      name: 'Sample Product 3',
      category: 'Industrial Crates',
      description: 'A third sample product for development',
      price: 399,
      image_url: 'https://via.placeholder.com/150',
      in_stock: false,
    }
  ];
}

function getMockCategories(): any[] {
  return [
    {
      id: 1,
      name: 'Plasticware',
      description: 'Durable plastic products for home and commercial use',
      icon: '🥤'
    },
    {
      id: 2,
      name: 'Kitchenware',
      description: 'Essential kitchen tools and appliances',
      icon: '🍳'
    },
    {
      id: 3,
      name: 'Industrial Crates',
      description: 'Heavy-duty storage and transport solutions',
      icon: '📦'
    }
  ];
} 