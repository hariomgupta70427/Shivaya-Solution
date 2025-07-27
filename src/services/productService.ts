import { createClient } from '@supabase/supabase-js';
import { Product, Category } from '../types/product';
import { convertProductsToCSV, parseCSVToProducts, convertProductCatalogToCSV, extractProductsFromData, normalizeProduct } from '../utils/csvConverter';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket name for product data
const BUCKET_NAME = 'product-data';
const PRODUCTS_FILE = 'products.csv';
const CATEGORIES_FILE = 'categories.csv';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseKey !== '';
};

/**
 * Helper function to convert categories to a format compatible with CSV conversion
 */
const categoriesToCSVFormat = (categories: Category[]): any[] => {
  return categories.map(category => ({
    ...category,
    // Add required Product fields that Category doesn't have
    name: category.name,
    category: category.name, // Use the category name as the category field
    description: category.description || '',
  }));
};

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using mock data.');
    return;
  }

  try {
    console.log('Checking if storage bucket exists...');
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Buckets:', buckets?.map(b => b.name).join(', ') || 'none');
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log('Creating bucket:', BUCKET_NAME);
      // Create bucket
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        allowedMimeTypes: ['text/csv', 'application/json', 'image/*'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
      console.log('Created storage bucket for product data');

      // Convert existing JSON catalog to CSV and upload
      try {
        console.log('Converting product catalog from JSON to CSV...');
        const csvData = await convertProductCatalogToCSV();
        console.log('CSV data length:', csvData.length);
        
        if (csvData && csvData.length > 0) {
          // Upload initial product data
          await uploadProductsCSV(csvData);
          console.log('Uploaded product catalog as CSV');
        } else {
          console.warn('No CSV data generated, using mock data');
          const mockProducts = getMockProducts();
          const mockCsvData = convertProductsToCSV(mockProducts);
          await uploadProductsCSV(mockCsvData);
        }
        
        // Create categories file
        const categories = getMockCategories();
        const categoriesFormatted = categoriesToCSVFormat(categories);
        const categoriesCSV = convertProductsToCSV(categoriesFormatted);
        await uploadCategoriesCSV(categoriesCSV);
      } catch (conversionError) {
        console.error('Error converting catalog to CSV:', conversionError);
        // Upload empty data if conversion fails
        await uploadProductsCSV('');
        await uploadCategoriesCSV('');
      }
    } else {
      console.log('Bucket already exists');
      
      // Check if products file exists
      const { data: productFileData, error: productFileError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { search: PRODUCTS_FILE });
      
      if (productFileError) {
        console.error('Error checking products file:', productFileError);
      } else if (!productFileData || productFileData.length === 0) {
        console.log('Products file does not exist, creating it...');
        const mockProducts = getMockProducts();
        const mockCsvData = convertProductsToCSV(mockProducts);
        await uploadProductsCSV(mockCsvData);
      } else {
        console.log('Products file exists');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  console.log('Getting products...');
  
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, returning mock products');
    return getMockProducts();
  }

  try {
    console.log('Fetching products from Supabase storage...');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(PRODUCTS_FILE);

    if (error) {
      console.warn('Error fetching products from storage, using mock data:', error);
      return getMockProducts();
    }

    const text = await data.text();
    console.log('CSV data received, length:', text.length);
    
    if (!text.trim()) {
      console.log('Empty CSV data, returning mock products');
      return getMockProducts();
    }
    
    try {
      const parsedProducts = parseCSVToProducts(text);
      console.log(`Successfully parsed ${parsedProducts.length} products from CSV`);
      return parsedProducts;
    } catch (parseError) {
      console.error('Error parsing CSV data:', parseError);
      return getMockProducts();
    }
  } catch (error) {
    console.error('Error getting products:', error);
    return getMockProducts();
  }
};

// Upload products to storage as CSV
export const uploadProductsCSV = async (csvData: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    console.log('Uploading products CSV, length:', csvData.length);
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(PRODUCTS_FILE, new Blob([csvData], { type: 'text/csv' }), {
        upsert: true,
        contentType: 'text/csv',
      });

    if (error) {
      console.error('Error uploading products CSV:', error);
      throw error;
    }
    
    console.log('Products CSV uploaded successfully');
  } catch (error) {
    console.error('Error uploading products CSV:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const products = await getProducts();
    
    // Generate a new ID
    const newId = products.length > 0 
      ? Math.max(...products.map(p => typeof p.id === 'number' ? p.id : 0)) + 1 
      : 1;
    
    const newProduct: Product = {
      ...product,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    products.push(newProduct);
    const csvData = convertProductsToCSV(products);
    await uploadProductsCSV(csvData);
    
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = {
      ...products[index],
      ...product,
      updated_at: new Date().toISOString(),
    };
    
    products[index] = updatedProduct;
    const csvData = convertProductsToCSV(products);
    await uploadProductsCSV(csvData);
    
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: number): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    let products = await getProducts();
    products = products.filter(p => p.id !== id);
    const csvData = convertProductsToCSV(products);
    await uploadProductsCSV(csvData);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) {
    return getMockCategories();
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(CATEGORIES_FILE);

    if (error) {
      console.warn('Error fetching categories from storage, using mock data:', error);
      return getMockCategories();
    }

    const text = await data.text();
    if (!text.trim()) {
      return getMockCategories();
    }
    
    // Parse CSV to products first, then convert to categories
    const productsData = parseCSVToProducts(text);
    
    // Convert from product format to category format
    const categories: Category[] = productsData.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: (p as any).icon || '📦',
      created_at: p.created_at,
      updated_at: p.updated_at
    }));
    
    return categories;
  } catch (error) {
    console.error('Error parsing categories:', error);
    return getMockCategories();
  }
};

// Upload categories to storage as CSV
export const uploadCategoriesCSV = async (csvData: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(CATEGORIES_FILE, new Blob([csvData], { type: 'text/csv' }), {
        upsert: true,
        contentType: 'text/csv',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error uploading categories CSV:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const categories = await getCategories();
    
    // Generate a new ID
    const newId = categories.length > 0 
      ? Math.max(...categories.map(c => typeof c.id === 'number' ? c.id : 0)) + 1 
      : 1;
    
    const newCategory: Category = {
      ...category,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    const categoriesFormatted = categoriesToCSVFormat(categories);
    const csvData = convertProductsToCSV(categoriesFormatted);
    await uploadCategoriesCSV(csvData);
    
    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = {
      ...categories[index],
      ...category,
      updated_at: new Date().toISOString(),
    };
    
    categories[index] = updatedCategory;
    const categoriesFormatted = categoriesToCSVFormat(categories);
    const csvData = convertProductsToCSV(categoriesFormatted);
    await uploadCategoriesCSV(csvData);
    
    return updatedCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: number): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    let categories = await getCategories();
    categories = categories.filter(c => c.id !== id);
    const categoriesFormatted = categoriesToCSVFormat(categories);
    const csvData = convertProductsToCSV(categoriesFormatted);
    await uploadCategoriesCSV(csvData);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Import products from JSON data
export const importProductsFromJson = async (jsonData: any[]): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    console.log('Importing products from JSON data, length:', jsonData.length);
    
    if (jsonData.length === 0) {
      // If no data provided, try to convert from JSON catalog
      console.log('No JSON data provided, converting from catalog...');
      const csvData = await convertProductCatalogToCSV();
      if (csvData && csvData.length > 0) {
        await uploadProductsCSV(csvData);
        console.log('Uploaded product catalog as CSV');
        return;
      } else {
        throw new Error('No data to import');
      }
    }
    
    // Transform the JSON data into our product format
    let products: Product[] = [];
    
    // Extract products from the data
    const extractedProducts = extractProductsFromData(jsonData);
    console.log(`Extracted ${extractedProducts.length} products from JSON data`);
    
    // Normalize the products
    products = extractedProducts.map((item, index) => normalizeProduct({
      ...item,
      id: index + 1,
    }));
    
    // Convert to CSV and upload
    const csvData = convertProductsToCSV(products);
    await uploadProductsCSV(csvData);
    console.log('Products imported and uploaded successfully');
    
    // Extract and save categories
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const categories: Category[] = uniqueCategories.map((name, index) => ({
      id: index + 1,
      name,
      description: `${name} products`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    const categoriesFormatted = categoriesToCSVFormat(categories);
    const categoriesCSV = convertProductsToCSV(categoriesFormatted);
    await uploadCategoriesCSV(categoriesCSV);
    console.log('Categories extracted and uploaded successfully');
  } catch (error) {
    console.error('Error importing products from JSON:', error);
    throw error;
  }
};

// Upload a product image to Supabase storage
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

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

function getMockCategories(): Category[] {
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