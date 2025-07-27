import { Product } from '../types/product';
import Papa from 'papaparse';

/**
 * Comprehensive catalog converter that handles all JSON files in the product-catalog directory
 * and converts them to a unified CSV format
 */

export interface CatalogFile {
  name: string;
  path: string;
  data?: any;
  products?: Product[];
  error?: string;
}

export interface ConversionResult {
  success: boolean;
  totalProducts: number;
  csvData: string;
  files: CatalogFile[];
  errors: string[];
}

/**
 * List of all JSON files in the product catalog
 */
export const CATALOG_FILES: CatalogFile[] = [
  {
    name: 'Dyna Metal Pen Catalog',
    path: '/product-catalog/Dyna Metal Pen Catalog.json'
  },
  {
    name: 'OJAS Kitchen World Catalogue',
    path: '/product-catalog/OJAS Kitchen World Catalogue Products List .json'
  },
  {
    name: 'HouseHold Products',
    path: '/product-catalog/HouseHold Products.json'
  },
  {
    name: 'Saran Enterprises Catalog',
    path: '/product-catalog/Saran Enterprises catalog.json'
  },
  {
    name: 'Other Products',
    path: '/product-catalog/other.json'
  },
  {
    name: 'Structured Catalog',
    path: '/product-catalog/structured-catalog.json'
  },
  {
    name: 'Videos',
    path: '/product-catalog/videos.json'
  }
];

/**
 * Normalizes a product object to ensure consistent structure
 */
export function normalizeProduct(product: any, categoryOverride?: string): Product {
  const now = new Date().toISOString();
  
  // Skip products with no name
  const productName = product.name || product.product_name || product.title || '';
  if (!productName.trim()) {
    return null as any; // Skip this product
  }
  
  return {
    id: product.id || 0,
    name: productName,
    category: categoryOverride || product.category || 'Uncategorized',
    subcategory: product.subcategory || product.sub_category || '',
    description: product.description || product.desc || '',
    price: product.price ? parseFloat(product.price.toString()) : undefined,
    image_url: product.image_url || product.image || product.img || '',
    in_stock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
    created_at: product.created_at || now,
    updated_at: product.updated_at || now,
    // Additional fields that might be present
    brand: product.brand || '',
    series: product.series || '',
    material: product.material || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : (product.features || ''),
    specifications: product.specifications || '',
    dimensions: product.dimensions || '',
    weight: product.weight || '',
    color: product.color || '',
    model: product.model || '',
    sku: product.sku || product.code || ''
  };
}

/**
 * Extracts products from various JSON structures
 */
export function extractProductsFromJSON(data: any, fileName: string): Product[] {
  const products: Product[] = [];
  
  try {
    // Case 1: Direct array of products
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.products && Array.isArray(item.products)) {
          // Case 1a: Array of categories with products
          const categoryName = item.category || item.name || 'Uncategorized';
          for (const product of item.products) {
            const normalizedProduct = normalizeProduct(product, categoryName);
            if (normalizedProduct) {
              products.push(normalizedProduct);
            }
          }
        } else if (item.subcategories && Array.isArray(item.subcategories)) {
          // Case 1b: Array of categories with subcategories
          const categoryName = item.category || item.name || 'Uncategorized';
          for (const subcategory of item.subcategories) {
            if (subcategory.products && Array.isArray(subcategory.products)) {
              for (const product of subcategory.products) {
                const normalizedProduct = normalizeProduct(product, categoryName);
                if (normalizedProduct) {
                  normalizedProduct.subcategory = subcategory.name || subcategory.subcategory || '';
                  products.push(normalizedProduct);
                }
              }
            }
          }
        } else {
          // Case 1c: Direct array of products
          const normalizedProduct = normalizeProduct(item);
          if (normalizedProduct) {
            products.push(normalizedProduct);
          }
        }
      }
    }
    // Case 2: Object with products array
    else if (data && typeof data === 'object') {
      if (data.products && Array.isArray(data.products)) {
        const categoryName = data.category || data.name || 'Uncategorized';
        for (const product of data.products) {
          const normalizedProduct = normalizeProduct(product, categoryName);
          if (normalizedProduct) {
            products.push(normalizedProduct);
          }
        }
      }
      // Case 3: Single product object
      else if (data.name || data.product_name || data.title) {
        const normalizedProduct = normalizeProduct(data);
        if (normalizedProduct) {
          products.push(normalizedProduct);
        }
      }
      // Case 4: Object with category keys
      else {
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            for (const item of value) {
              const normalizedProduct = normalizeProduct(item, key);
              if (normalizedProduct) {
                products.push(normalizedProduct);
              }
            }
          } else if (value && typeof value === 'object') {
            const normalizedProduct = normalizeProduct(value, key);
            if (normalizedProduct) {
              products.push(normalizedProduct);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error extracting products from ${fileName}:`, error);
  }
  
  return products;
}

/**
 * Fetches and processes a single catalog file
 */
export async function processCatalogFile(file: CatalogFile): Promise<CatalogFile> {
  try {
    console.log(`Processing ${file.name}...`);
    
    const response = await fetch(file.path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty file');
    }
    
    const data = JSON.parse(text);
    const products = extractProductsFromJSON(data, file.name);
    
    return {
      ...file,
      data,
      products,
      error: undefined
    };
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    return {
      ...file,
      data: undefined,
      products: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Converts all catalog files to a single CSV
 */
export async function convertAllCatalogsToCSV(): Promise<ConversionResult> {
  const result: ConversionResult = {
    success: false,
    totalProducts: 0,
    csvData: '',
    files: [],
    errors: []
  };
  
  try {
    console.log('Starting catalog conversion...');
    
    // Process all files
    const processedFiles = await Promise.all(
      CATALOG_FILES.map(file => processCatalogFile(file))
    );
    
    result.files = processedFiles;
    
    // Collect all products
    const allProducts: Product[] = [];
    let productId = 1;
    
    for (const file of processedFiles) {
      if (file.error) {
        result.errors.push(`${file.name}: ${file.error}`);
        continue;
      }
      
      if (file.products && file.products.length > 0) {
        // Assign sequential IDs
        const productsWithIds = file.products.map(product => ({
          ...product,
          id: productId++
        }));
        
        allProducts.push(...productsWithIds);
        console.log(`Added ${productsWithIds.length} products from ${file.name}`);
      }
    }
    
    if (allProducts.length === 0) {
      throw new Error('No products found in any catalog files');
    }
    
    // Sort products by category and name for better organization
    allProducts.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Convert to CSV
    result.csvData = Papa.unparse(allProducts, {
      header: true,
      delimiter: ',',
      newline: '\n',
      escapeChar: '"',
      quoteChar: '"',
      quotes: true
    });
    
    result.totalProducts = allProducts.length;
    result.success = true;
    
    console.log(`Successfully converted ${result.totalProducts} products to CSV`);
    
    return result;
  } catch (error) {
    console.error('Error converting catalogs to CSV:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Downloads CSV data as a file
 */
export function downloadCSV(csvData: string, filename: string = 'products.csv'): void {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Saves CSV data to local storage for persistence
 */
export function saveCSVToLocalStorage(csvData: string, key: string = 'products_csv'): void {
  try {
    localStorage.setItem(key, csvData);
    localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
    console.log('CSV data saved to local storage');
  } catch (error) {
    console.error('Error saving CSV to local storage:', error);
  }
}

/**
 * Loads CSV data from local storage
 */
export function loadCSVFromLocalStorage(key: string = 'products_csv'): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error loading CSV from local storage:', error);
    return null;
  }
}

/**
 * Gets the timestamp when CSV was last saved
 */
export function getCSVTimestamp(key: string = 'products_csv'): string | null {
  try {
    return localStorage.getItem(`${key}_timestamp`);
  } catch (error) {
    console.error('Error getting CSV timestamp:', error);
    return null;
  }
}