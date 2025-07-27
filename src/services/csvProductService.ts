import { Product } from '../types/product';
import Papa from 'papaparse';
import { 
  convertAllCatalogsToCSV, 
  saveCSVToLocalStorage, 
  loadCSVFromLocalStorage,
  downloadCSV 
} from '../utils/catalogConverter';
import ErrorHandler from '../utils/errorHandler';
import PerformanceMonitor from '../utils/performance';

/**
 * Enhanced CSV-based product service that manages products in CSV format
 * with local storage fallback and comprehensive CRUD operations
 */

const CSV_STORAGE_KEY = 'shivaya_products_csv';
const CATEGORIES_STORAGE_KEY = 'shivaya_categories_csv';

export interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  lastUpdated: string;
  productsByCategory: Record<string, number>;
}

/**
 * Parses CSV data into products array
 */
export function parseCSVToProducts(csvData: string): Product[] {
  try {
    const result = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"'
    });
    
    if (result.errors && result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }
    
    return result.data.map((item: any) => ({
      id: item.id || 0,
      name: item.name || '',
      category: item.category || 'Uncategorized',
      subcategory: item.subcategory || '',
      description: item.description || '',
      price: item.price ? parseFloat(item.price.toString()) : undefined,
      image_url: item.image_url || '',
      in_stock: item.in_stock !== undefined ? Boolean(item.in_stock) : true,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      // Additional fields
      brand: item.brand || '',
      series: item.series || '',
      material: item.material || '',
      features: item.features || '',
      specifications: item.specifications || '',
      dimensions: item.dimensions || '',
      weight: item.weight || '',
      color: item.color || '',
      model: item.model || '',
      sku: item.sku || ''
    })) as Product[];
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * Converts products array to CSV string
 */
export function convertProductsToCSV(products: Product[]): string {
  return Papa.unparse(products, {
    header: true,
    delimiter: ',',
    newline: '\n',
    escapeChar: '"',
    quoteChar: '"',
    quotes: true
  });
}

/**
 * Loads CSV data from the pre-converted file
 */
async function loadConvertedCSV(): Promise<string | null> {
  try {
    // Try to load the complete CSV file first
    console.log('Attempting to load complete CSV file...');
    const response = await fetch('/csv-output/all-products-complete.csv');
    if (response.ok) {
      const csvData = await response.text();
      console.log(`Loaded complete CSV file with ${csvData.length} characters and ${csvData.split('\n').length} lines`);
      return csvData;
    } else {
      console.warn(`Failed to load complete CSV: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Could not load complete CSV file, trying fallback:', error);
  }
  
  try {
    // Try to load the categorized CSV file next
    console.log('Attempting to load categorized CSV file...');
    const response = await fetch('/csv-output/all-products-categorized.csv');
    if (response.ok) {
      const csvData = await response.text();
      console.log(`Loaded categorized CSV file with ${csvData.length} characters and ${csvData.split('\n').length} lines`);
      return csvData;
    } else {
      console.warn(`Failed to load categorized CSV: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Could not load categorized CSV file, trying fallback:', error);
  }
  
  try {
    // Fallback to the original converted CSV file
    console.log('Attempting to load fallback CSV file...');
    const response = await fetch('/csv-output/all-products-converted.csv');
    if (response.ok) {
      const csvData = await response.text();
      console.log(`Loaded fallback CSV file with ${csvData.length} characters and ${csvData.split('\n').length} lines`);
      return csvData;
    } else {
      console.warn(`Failed to load fallback CSV: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Could not load fallback CSV file:', error);
  }
  
  // Fallback to converting from JSON catalogs
  try {
    console.log('Fallback: Converting from JSON catalogs...');
    const result = await convertAllCatalogsToCSV();
    if (result.success) {
      return result.csvData;
    }
  } catch (error) {
    console.error('Error converting from JSON catalogs:', error);
  }
  
  return null;
}

/**
 * Initializes the CSV product database by loading pre-converted CSV or converting JSON catalogs
 */
// Cache for initialization to prevent multiple simultaneous calls
let initializationCache: Promise<boolean> | null = null;

export async function initializeCSVDatabase(): Promise<boolean> {
  // Return cached promise if initialization is already in progress
  if (initializationCache) {
    console.log('CSV database initialization already in progress, waiting...');
    return initializationCache;
  }

  // Create and cache the initialization promise
  initializationCache = performInitialization();
  
  try {
    const result = await initializationCache;
    return result;
  } finally {
    // Clear cache after completion (success or failure)
    initializationCache = null;
  }
}

async function performInitialization(): Promise<boolean> {
  try {
    console.log('Initializing CSV database...');
    
    // Check if we already have data in local storage
    const existingData = loadCSVFromLocalStorage(CSV_STORAGE_KEY);
    if (existingData && existingData.trim()) {
      console.log('CSV database already exists in local storage');
      // Verify the data is valid
      try {
        const products = parseCSVToProducts(existingData);
        if (products.length > 0) {
          console.log(`Using cached CSV data with ${products.length} products`);
          return true;
        }
      } catch (parseError) {
        console.warn('Cached CSV data is invalid, refreshing...', parseError);
        // Clear invalid data
        localStorage.removeItem(CSV_STORAGE_KEY);
      }
    }
    
    // Load CSV data
    console.log('Loading fresh CSV data...');
    const csvData = await loadConvertedCSV();
    
    if (!csvData) {
      console.error('Failed to load or convert product data');
      return false;
    }
    
    // Validate CSV data
    try {
      const products = parseCSVToProducts(csvData);
      if (products.length === 0) {
        console.error('CSV data contains no valid products');
        return false;
      }
      
      // Save to local storage
      saveCSVToLocalStorage(csvData, CSV_STORAGE_KEY);
      console.log(`CSV database initialized with ${products.length} products`);
      return true;
    } catch (parseError) {
      console.error('Failed to parse CSV data:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Error initializing CSV database:', error);
    return false;
  }
}

/**
 * Gets all products from CSV storage
 */
export async function getAllProducts(): Promise<Product[]> {
  return PerformanceMonitor.measureAsync('getAllProducts', async () => {
    return ErrorHandler.safeAsync(async () => {
      // Try to load from local storage first
      let csvData = loadCSVFromLocalStorage(CSV_STORAGE_KEY);
      
      if (!csvData || !csvData.trim()) {
        console.log('No CSV data in storage, initializing...');
        const initialized = await initializeCSVDatabase();
        if (!initialized) {
          console.warn('Failed to initialize CSV database, returning empty array');
          return [];
        }
        csvData = loadCSVFromLocalStorage(CSV_STORAGE_KEY);
      }
      
      if (!csvData) {
        return [];
      }
      
      const products = parseCSVToProducts(csvData);
      console.log(`✅ Loaded ${products.length} products from CSV`);
      return products;
    }, [], 'getAllProducts');
  });
}

/**
 * Gets a single product by ID
 */
export async function getProductById(id: number): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

/**
 * Creates a new product
 */
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  try {
    const products = await getAllProducts();
    
    // Generate new ID
    const maxId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) : 0;
    const newId = maxId + 1;
    
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: newId,
      created_at: now,
      updated_at: now
    };
    
    products.push(newProduct);
    
    // Save back to storage
    const csvData = convertProductsToCSV(products);
    saveCSVToLocalStorage(csvData, CSV_STORAGE_KEY);
    
    console.log(`Created product with ID ${newId}`);
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Updates an existing product
 */
export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
  try {
    const products = await getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    
    // Save back to storage
    const csvData = convertProductsToCSV(products);
    saveCSVToLocalStorage(csvData, CSV_STORAGE_KEY);
    
    console.log(`Updated product with ID ${id}`);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Deletes a product
 */
export async function deleteProduct(id: number): Promise<void> {
  try {
    const products = await getAllProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Save back to storage
    const csvData = convertProductsToCSV(filteredProducts);
    saveCSVToLocalStorage(csvData, CSV_STORAGE_KEY);
    
    console.log(`Deleted product with ID ${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Bulk import products from CSV data
 */
export async function importProductsFromCSV(csvData: string, replaceExisting: boolean = false): Promise<number> {
  try {
    const newProducts = parseCSVToProducts(csvData);
    
    if (newProducts.length === 0) {
      throw new Error('No valid products found in CSV data');
    }
    
    let existingProducts: Product[] = [];
    
    if (!replaceExisting) {
      existingProducts = await getAllProducts();
    }
    
    // Assign new IDs to imported products
    const maxId = existingProducts.length > 0 ? Math.max(...existingProducts.map(p => Number(p.id) || 0)) : 0;
    const productsWithNewIds = newProducts.map((product, index) => ({
      ...product,
      id: maxId + index + 1,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const allProducts = replaceExisting ? productsWithNewIds : [...existingProducts, ...productsWithNewIds];
    
    // Save to storage
    const finalCsvData = convertProductsToCSV(allProducts);
    saveCSVToLocalStorage(finalCsvData, CSV_STORAGE_KEY);
    
    console.log(`Imported ${productsWithNewIds.length} products`);
    return productsWithNewIds.length;
  } catch (error) {
    console.error('Error importing products from CSV:', error);
    throw error;
  }
}

/**
 * Exports all products as CSV
 */
export async function exportProductsAsCSV(): Promise<string> {
  const products = await getAllProducts();
  return convertProductsToCSV(products);
}

/**
 * Downloads all products as CSV file
 */
export async function downloadProductsCSV(filename: string = 'shivaya-products.csv'): Promise<void> {
  const csvData = await exportProductsAsCSV();
  downloadCSV(csvData, filename);
}

/**
 * Gets product statistics
 */
export async function getProductStats(): Promise<ProductStats> {
  const products = await getAllProducts();
  const categories = [...new Set(products.map(p => p.category))];
  
  const productsByCategory: Record<string, number> = {};
  for (const category of categories) {
    productsByCategory[category] = products.filter(p => p.category === category).length;
  }
  
  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    lastUpdated: new Date().toISOString(),
    productsByCategory
  };
}

/**
 * Searches products by name, description, or category
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    (product.subcategory?.toLowerCase() || '').includes(lowerQuery)
  );
}

/**
 * Gets products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(p => p.category === category);
}

/**
 * Gets all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const products = await getAllProducts();
  return [...new Set(products.map(p => p.category))].sort();
}

/**
 * Refreshes the CSV database by re-converting JSON catalogs
 */
export async function refreshCSVDatabase(): Promise<boolean> {
  try {
    console.log('Refreshing CSV database...');
    
    const result = await convertAllCatalogsToCSV();
    
    if (!result.success) {
      console.error('Failed to refresh database:', result.errors);
      return false;
    }
    
    // Save to local storage
    saveCSVToLocalStorage(result.csvData, CSV_STORAGE_KEY);
    
    console.log(`CSV database refreshed with ${result.totalProducts} products`);
    return true;
  } catch (error) {
    console.error('Error refreshing CSV database:', error);
    return false;
  }
}