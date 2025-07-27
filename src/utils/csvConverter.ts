import { Product } from '../types/product';
import Papa from 'papaparse';

/**
 * Converts product data from JSON to CSV format
 * @param products Array of product objects
 * @returns CSV string representation of the products
 */
export function convertProductsToCSV(products: Product[]): string {
  // Use unparse with proper configuration to avoid field issues
  return Papa.unparse(products, {
    header: true,
    delimiter: ",",
    newline: "\n",
    escapeChar: '"',
    quoteChar: '"',
    quotes: true  // Always quote fields to avoid parsing issues
  });
}

/**
 * Parses CSV data into product objects
 * @param csvData CSV string data
 * @returns Array of product objects
 */
export function parseCSVToProducts(csvData: string): Product[] {
  const result = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true, // Automatically convert strings to numbers, etc.
    skipEmptyLines: true,
    delimiter: ",",
    quoteChar: '"',
    escapeChar: '"'
  });
  
  if (result.errors && result.errors.length > 0) {
    console.warn("CSV parsing errors:", result.errors);
  }
  
  return result.data as Product[];
}

/**
 * Normalizes product data to ensure all required fields are present
 * @param product Raw product data
 * @returns Normalized product object
 */
export function normalizeProduct(product: any): Product {
  return {
    id: product.id || 0,
    name: product.name || product.product_name || '',
    category: product.category || 'Uncategorized',
    subcategory: product.subcategory || '',
    description: product.description || '',
    price: product.price !== undefined ? Number(product.price) : undefined,
    image_url: product.image_url || product.image || '',
    in_stock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString(),
  };
}

/**
 * Safely extracts products from different JSON structures
 * @param data JSON data that might contain products
 * @returns Array of products
 */
export function extractProductsFromData(data: any): any[] {
  // Case 1: Direct array of products
  if (Array.isArray(data)) {
    if (data.length > 0) {
      if (!data[0].products) {
        return data;
      } else {
        // Case 2: Array of categories with products
        let allProducts: any[] = [];
        data.forEach(category => {
          if (category.products && Array.isArray(category.products)) {
            const productsWithCategory = category.products.map((product: any) => ({
              ...product,
              category: category.category || 'Uncategorized'
            }));
            allProducts = [...allProducts, ...productsWithCategory];
          }
        });
        return allProducts;
      }
    }
    return [];
  }
  
  // Case 3: Object with products array
  if (data && typeof data === 'object' && data.products && Array.isArray(data.products)) {
    return data.products.map((product: any) => ({
      ...product,
      category: data.category || 'Uncategorized'
    }));
  }
  
  // Case 4: Single product object
  if (data && typeof data === 'object' && !Array.isArray(data) && (data.name || data.product_name)) {
    return [data];
  }
  
  // Default: empty array
  return [];
}

/**
 * Converts JSON files from product-catalog to a single CSV file
 * @param jsonData Array of raw JSON data from different files
 * @returns CSV string with all products organized by category
 */
export function convertCatalogToCSV(jsonData: any[]): string {
  // Collect all products from different JSON structures
  let allProducts: Product[] = [];
  
  jsonData.forEach(data => {
    try {
      const extractedProducts = extractProductsFromData(data);
      const normalizedProducts = extractedProducts.map((item: any) => normalizeProduct(item));
      allProducts = [...allProducts, ...normalizedProducts];
    } catch (error) {
      console.error('Error processing data:', error);
    }
  });
  
  // Sort products by category for better organization
  allProducts.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return 0;
  });
  
  // Assign IDs if missing
  allProducts = allProducts.map((product, index) => ({
    ...product,
    id: product.id || index + 1
  }));
  
  // Log for debugging
  console.log(`Converted ${allProducts.length} products to CSV`);
  
  return convertProductsToCSV(allProducts);
}

/**
 * Reads JSON files from product-catalog directory and converts them to CSV
 * @returns Promise resolving to CSV string with all products
 */
export async function convertProductCatalogToCSV(): Promise<string> {
  try {
    // Define catalog files
    const catalogFiles = [
      '/product-catalog/Dyna Metal Pen Catalog.json',
      '/product-catalog/OJAS Kitchen World Catalogue Products List .json',
      '/product-catalog/HouseHold Products.json',
      '/product-catalog/Saran Enterprises catalog.json',
      '/product-catalog/other.json'
    ];
    
    const allData: any[] = [];
    
    // Fetch and process each file
    for (const file of catalogFiles) {
      try {
        console.log(`Fetching ${file}...`);
        const response = await fetch(file);
        if (!response.ok) {
          console.warn(`Failed to fetch ${file}: ${response.statusText}`);
          continue;
        }
        
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          allData.push(data);
          console.log(`Successfully loaded ${file}`);
        } catch (parseError) {
          console.error(`Error parsing JSON from ${file}:`, parseError);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    // Convert all data to CSV
    return convertCatalogToCSV(allData);
  } catch (error) {
    console.error('Error converting catalog to CSV:', error);
    throw error;
  }
} 