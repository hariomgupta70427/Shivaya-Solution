#!/usr/bin/env node

/**
 * Script to convert all JSON catalog files to CSV format
 * This script can be run independently to generate CSV files from the JSON catalogs
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CATALOG_DIR = path.join(__dirname, '..', 'src', 'product-catalog');
const OUTPUT_DIR = path.join(__dirname, '..', 'csv-output');
const COMBINED_OUTPUT_FILE = path.join(OUTPUT_DIR, 'all-products-converted.csv');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Normalizes a product object to ensure consistent structure
 */
function normalizeProduct(product, categoryOverride) {
  const now = new Date().toISOString();
  
  return {
    id: product.id || 0,
    name: product.name || product.product_name || product.title || 'Unnamed Product',
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
function extractProductsFromJSON(data, fileName) {
  const products = [];
  
  try {
    // Case 1: Direct array of products
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.products && Array.isArray(item.products)) {
          // Case 1a: Array of categories with products
          const categoryName = item.category || item.name || 'Uncategorized';
          for (const product of item.products) {
            products.push(normalizeProduct(product, categoryName));
          }
        } else if (item.subcategories && Array.isArray(item.subcategories)) {
          // Case 1b: Array of categories with subcategories
          const categoryName = item.category || item.name || 'Uncategorized';
          for (const subcategory of item.subcategories) {
            if (subcategory.products && Array.isArray(subcategory.products)) {
              for (const product of subcategory.products) {
                const normalizedProduct = normalizeProduct(product, categoryName);
                normalizedProduct.subcategory = subcategory.name || subcategory.subcategory || '';
                products.push(normalizedProduct);
              }
            }
          }
        } else {
          // Case 1c: Direct array of products
          products.push(normalizeProduct(item));
        }
      }
    }
    // Case 2: Object with products array
    else if (data && typeof data === 'object') {
      if (data.products && Array.isArray(data.products)) {
        const categoryName = data.category || data.name || 'Uncategorized';
        for (const product of data.products) {
          products.push(normalizeProduct(product, categoryName));
        }
      }
      // Case 3: Single product object
      else if (data.name || data.product_name || data.title) {
        products.push(normalizeProduct(data));
      }
      // Case 4: Object with category keys
      else {
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            for (const item of value) {
              products.push(normalizeProduct(item, key));
            }
          } else if (value && typeof value === 'object') {
            products.push(normalizeProduct(value, key));
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
 * Processes a single JSON file
 */
function processJSONFile(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const products = extractProductsFromJSON(data, path.basename(filePath));
    
    console.log(`  Extracted ${products.length} products`);
    return products;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Main conversion function
 */
function convertCatalogsToCSV() {
  console.log('Starting catalog conversion...');
  console.log(`Looking for JSON files in: ${CATALOG_DIR}`);
  
  if (!fs.existsSync(CATALOG_DIR)) {
    console.error(`Catalog directory not found: ${CATALOG_DIR}`);
    return;
  }
  
  // Get all JSON files
  const files = fs.readdirSync(CATALOG_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(CATALOG_DIR, file));
  
  console.log(`Found ${files.length} JSON files:`);
  files.forEach(file => console.log(`  - ${path.basename(file)}`));
  
  if (files.length === 0) {
    console.log('No JSON files found to convert.');
    return;
  }
  
  // Process all files
  const allProducts = [];
  let productId = 1;
  
  for (const file of files) {
    const products = processJSONFile(file);
    
    // Assign sequential IDs
    const productsWithIds = products.map(product => ({
      ...product,
      id: productId++
    }));
    
    allProducts.push(...productsWithIds);
    
    // Also save individual file CSV
    if (products.length > 0) {
      const fileName = path.basename(file, '.json');
      const csvFileName = path.join(OUTPUT_DIR, `${fileName}.csv`);
      const csvData = Papa.unparse(productsWithIds, {
        header: true,
        delimiter: ',',
        newline: '\n',
        escapeChar: '"',
        quoteChar: '"',
        quotes: true
      });
      
      fs.writeFileSync(csvFileName, csvData);
      console.log(`  Saved individual CSV: ${path.basename(csvFileName)}`);
    }
  }
  
  if (allProducts.length === 0) {
    console.log('No products found in any files.');
    return;
  }
  
  // Sort products by category and name
  allProducts.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
  
  // Convert to CSV
  const csvData = Papa.unparse(allProducts, {
    header: true,
    delimiter: ',',
    newline: '\n',
    escapeChar: '"',
    quoteChar: '"',
    quotes: true
  });
  
  // Save combined CSV
  fs.writeFileSync(COMBINED_OUTPUT_FILE, csvData);
  
  console.log('\n=== Conversion Complete ===');
  console.log(`Total products converted: ${allProducts.length}`);
  console.log(`Combined CSV saved to: ${path.basename(COMBINED_OUTPUT_FILE)}`);
  console.log(`Individual CSV files saved to: ${OUTPUT_DIR}`);
  
  // Show category breakdown
  const categoryCount = {};
  allProducts.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
  });
  
  console.log('\nProducts by category:');
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
}

// Run the conversion
convertCatalogsToCSV();

export { convertCatalogsToCSV, normalizeProduct, extractProductsFromJSON };