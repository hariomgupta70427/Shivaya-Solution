#!/usr/bin/env node

/**
 * Enhanced script to convert all JSON catalog files to properly categorized CSV format
 * Organizes products into 5 main categories: Metal Pen, Kitchenware, Household, Plasticware, Other
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CATALOG_DIRS = [
  path.join(__dirname, '..', 'src', 'product-catalog'),
  path.join(__dirname, '..', 'public', 'data'),
  path.join(__dirname, '..', 'public', 'product-catalog')
];
const OUTPUT_DIR = path.join(__dirname, '..', 'csv-output');
const COMBINED_OUTPUT_FILE = path.join(OUTPUT_DIR, 'all-products-categorized.csv');

// Main category mapping
const MAIN_CATEGORIES = {
  METAL_PEN: 'Metal Pen',
  KITCHENWARE: 'Kitchenware', 
  HOUSEHOLD: 'Household',
  PLASTICWARE: 'Plasticware',
  OTHER: 'Other'
};

// Category classification rules
const CATEGORY_RULES = {
  // Metal Pen category
  [MAIN_CATEGORIES.METAL_PEN]: [
    'pen', 'metal pen', 'astral', 'vertex', 'dyna', 'writing', 'ballpoint', 'gel pen'
  ],
  
  // Kitchenware category
  [MAIN_CATEGORIES.KITCHENWARE]: [
    'kitchen', 'cookware', 'pressure cooker', 'gas stove', 'dinner set', 'masala box', 
    'roti box', 'lemon set', 'jug', 'glass cover', 'barbeque', 'traditional cookware',
    'premium cookware', 'tri-ply', 'stainless steel', 'cooking', 'utensil'
  ],
  
  // Household category  
  [MAIN_CATEGORIES.HOUSEHOLD]: [
    'household', 'bathroom', 'toilet', 'shaving', 'razor', 'soap', 'dental', 'oral care',
    'hotel amenities', 'guest', 'toiletries', 'shower cap', 'disposable slipper', 
    'naphthalene', 'comb', 'sewing kit', 'shoe shiner', 'laundry bag', 'urinal screen',
    'deodorizer', 'artificial toilet', 'toilet seat', 'wc band'
  ],
  
  // Plasticware category
  [MAIN_CATEGORIES.PLASTICWARE]: [
    'bucket', 'mug', 'basket', 'rack', 'storage', 'container', 'bin', 'dustbin', 'drum',
    'crate', 'plastic', 'tub', 'basin', 'donga', 'bowl', 'plate', 'tray', 'thermoware',
    'fridge bottle', 'water bottle', 'chair', 'bench', 'patla'
  ]
};

// Subcategory mapping for better organization
const SUBCATEGORY_MAPPING = {
  // Metal Pen subcategories
  'astral series': 'Astral Series',
  'vertex series': 'Vertex Series', 
  'premium series': 'Premium Series',
  'classic series': 'Classic Series',
  
  // Kitchenware subcategories
  'pressure cooker': 'Pressure Cookers',
  'gas stove': 'Gas Stoves',
  'dinner set': 'Dinner Sets',
  'cookware': 'Cookware',
  'premium cookware': 'Premium Cookware',
  'traditional cookware': 'Traditional Cookware',
  
  // Household subcategories
  'bathroom set': 'Bathroom Accessories',
  'shaving kit': 'Shaving & Grooming',
  'hotel amenities': 'Hotel Amenities',
  'guest toiletries': 'Guest Toiletries',
  'dental care': 'Dental & Oral Care',
  
  // Plasticware subcategories
  'water bucket': 'Water Buckets',
  'storage container': 'Storage Containers',
  'industrial crate': 'Industrial Crates',
  'fridge bottle': 'Fridge Bottles',
  'dustbin': 'Dustbins & Waste Management',
  'basket': 'Baskets & Racks',
  'chair': 'Chairs & Furniture'
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Determines the main category based on product name and context
 */
function determineMainCategory(productName, categoryContext, seriesContext, fileName) {
  const searchText = `${productName} ${categoryContext} ${seriesContext} ${fileName}`.toLowerCase();
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category;
    }
  }
  
  // File-based fallback categorization
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.includes('metal pen') || lowerFileName.includes('dyna')) {
    return MAIN_CATEGORIES.METAL_PEN;
  }
  if (lowerFileName.includes('kitchen') || lowerFileName.includes('ojas')) {
    return MAIN_CATEGORIES.KITCHENWARE;
  }
  if (lowerFileName.includes('household')) {
    return MAIN_CATEGORIES.HOUSEHOLD;
  }
  if (lowerFileName.includes('saran') || lowerFileName.includes('plastic')) {
    return MAIN_CATEGORIES.PLASTICWARE;
  }
  
  return MAIN_CATEGORIES.OTHER;
}

/**
 * Determines subcategory based on context
 */
function determineSubcategory(productName, categoryContext, seriesContext) {
  const searchText = `${productName} ${categoryContext} ${seriesContext}`.toLowerCase();
  
  for (const [key, subcategory] of Object.entries(SUBCATEGORY_MAPPING)) {
    if (searchText.includes(key)) {
      return subcategory;
    }
  }
  
  // Return the original category context as subcategory if no mapping found
  return categoryContext || seriesContext || '';
}

/**
 * Normalizes a product object with proper categorization
 */
function normalizeProduct(product, context, fileName) {
  const now = new Date().toISOString();
  
  // Better product name extraction
  let productName = product.name || product.model || product.variant || 
                   product.outer_dimension || product.title || product.product_name;
  
  // If still no name, try to construct from available data
  if (!productName || productName === 'Unnamed Product') {
    if (product.series && product.model) {
      productName = `${product.series} ${product.model}`;
    } else if (context.series && product.model) {
      productName = `${context.series} ${product.model}`;
    } else if (product.dimensions || product.outer_dimension) {
      productName = `${context.category || 'Product'} ${product.dimensions || product.outer_dimension}`;
    } else if (product.capacity_l) {
      productName = `${context.category || 'Container'} ${product.capacity_l}L`;
    } else if (context.series) {
      productName = context.series;
    } else {
      // Skip products without meaningful names
      return null;
    }
  }
  
  const categoryContext = context.category || context.series || '';
  const seriesContext = context.series || product.series || '';
  
  const mainCategory = determineMainCategory(productName, categoryContext, seriesContext, fileName);
  const subcategory = determineSubcategory(productName, categoryContext, seriesContext);
  
  return {
    id: product.id || 0,
    name: productName,
    category: mainCategory,
    subcategory: subcategory,
    description: product.description || context.description || 
                `${productName} from ${seriesContext || categoryContext}`,
    price: product.price ? parseFloat(product.price.toString()) : undefined,
    image_url: product.image_url || product.image || '',
    in_stock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
    created_at: product.created_at || now,
    updated_at: product.updated_at || now,
    brand: product.brand || context.brand || 'Shivaya',
    series: seriesContext,
    material: product.material || context.material || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : 
             (product.features || context.features || ''),
    specifications: product.specifications || context.specifications || '',
    dimensions: product.dimensions || product.outer_dimension || product.inner_dimension || '',
    weight: product.weight || '',
    color: product.color || '',
    model: product.model || product.code || '',
    sku: product.sku || product.model || product.code || '',
    capacity: product.capacity_l || product.capacity || '',
    variants: product.variants ? (Array.isArray(product.variants) ? 
             product.variants.join(', ') : product.variants) : ''
  };
}

/**
 * Extracts products from Dyna Metal Pen Catalog structure
 */
function extractFromDynaCatalog(data, fileName) {
  const products = [];
  let productId = 1;
  
  if (Array.isArray(data)) {
    for (const series of data) {
      if (series.products && Array.isArray(series.products)) {
        for (const product of series.products) {
          const normalizedProduct = normalizeProduct(product, series, fileName);
          if (normalizedProduct) {
            normalizedProduct.id = productId++;
            products.push(normalizedProduct);
          }
        }
      }
    }
  }
  
  return products;
}

/**
 * Extracts products from HouseHold Products structure
 */
function extractFromHouseholdCatalog(data, fileName) {
  const products = [];
  let productId = 1000; // Start from 1000 to avoid ID conflicts
  
  if (Array.isArray(data)) {
    for (const category of data) {
      if (category.products && Array.isArray(category.products)) {
        for (const productGroup of category.products) {
          if (productGroup.variants && Array.isArray(productGroup.variants)) {
            // Handle variants
            for (const variant of productGroup.variants) {
              const product = {
                name: variant,
                series: productGroup.series,
                features: productGroup.features
              };
              const normalizedProduct = normalizeProduct(product, category, fileName);
              if (normalizedProduct) {
                normalizedProduct.id = productId++;
                products.push(normalizedProduct);
              }
            }
          } else {
            // Handle direct products
            const normalizedProduct = normalizeProduct(productGroup, category, fileName);
            if (normalizedProduct) {
              normalizedProduct.id = productId++;
              products.push(normalizedProduct);
            }
          }
        }
      }
    }
  }
  
  return products;
}

/**
 * Extracts products from Saran Enterprises catalog structure
 */
function extractFromSaranCatalog(data, fileName) {
  const products = [];
  let productId = 2000; // Start from 2000 to avoid ID conflicts
  
  if (Array.isArray(data)) {
    for (const category of data) {
      if (category.series && Array.isArray(category.series)) {
        for (const series of category.series) {
          if (series.variants && Array.isArray(series.variants)) {
            for (const variant of series.variants) {
              const product = {
                name: `${series.name} - ${variant.outer_dimension}`,
                outer_dimension: variant.outer_dimension,
                inner_dimension: variant.inner_dimension,
                capacity_l: variant.capacity_l,
                series: series.name
              };
              const normalizedProduct = normalizeProduct(product, category, fileName);
              if (normalizedProduct) {
                normalizedProduct.id = productId++;
                products.push(normalizedProduct);
              }
            }
          }
        }
      }
    }
  }
  
  return products;
}

/**
 * Extracts products from OJAS Kitchen catalog structure
 */
function extractFromOjasCatalog(data, fileName) {
  const products = [];
  let productId = 3000; // Start from 3000 to avoid ID conflicts
  
  // Handle various structures in OJAS catalog
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.products && Array.isArray(item.products)) {
        for (const product of item.products) {
          const normalizedProduct = normalizeProduct(product, item, fileName);
          if (normalizedProduct) {
            normalizedProduct.id = productId++;
            products.push(normalizedProduct);
          }
        }
      } else {
        const normalizedProduct = normalizeProduct(item, {}, fileName);
        if (normalizedProduct) {
          normalizedProduct.id = productId++;
          products.push(normalizedProduct);
        }
      }
    }
  } else if (data && typeof data === 'object') {
    // Handle object structure
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          const normalizedProduct = normalizeProduct(item, { category: key }, fileName);
          if (normalizedProduct) {
            normalizedProduct.id = productId++;
            products.push(normalizedProduct);
          }
        }
      }
    }
  }
  
  return products;
}

/**
 * Extracts products from products1.json and products2.json structure
 */
function extractFromProductsDataCatalog(data, fileName) {
  const products = [];
  let productId = 4000; // Start from 4000 to avoid ID conflicts
  
  if (Array.isArray(data)) {
    for (const item of data) {
      // These files have a different structure with id, name, category, type, etc.
      const product = {
        name: item.name,
        category: item.category,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        tags: item.tags
      };
      
      const normalizedProduct = normalizeProduct(product, { 
        category: item.category,
        subcategory: item.type 
      }, fileName);
      if (normalizedProduct) {
        normalizedProduct.id = productId++;
        products.push(normalizedProduct);
      }
    }
  }
  
  return products;
}

/**
 * Generic extractor for other catalog structures
 */
function extractFromGenericCatalog(data, fileName) {
  const products = [];
  let productId = 5000; // Start from 5000 to avoid ID conflicts
  
  try {
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.products && Array.isArray(item.products)) {
          for (const product of item.products) {
            const normalizedProduct = normalizeProduct(product, item, fileName);
            if (normalizedProduct) {
              normalizedProduct.id = productId++;
              products.push(normalizedProduct);
            }
          }
        } else {
          const normalizedProduct = normalizeProduct(item, {}, fileName);
          if (normalizedProduct) {
            normalizedProduct.id = productId++;
            products.push(normalizedProduct);
          }
        }
      }
    } else if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            const normalizedProduct = normalizeProduct(item, { category: key }, fileName);
            if (normalizedProduct) {
              normalizedProduct.id = productId++;
              products.push(normalizedProduct);
            }
          }
        } else if (value && typeof value === 'object') {
          const normalizedProduct = normalizeProduct(value, { category: key }, fileName);
          if (normalizedProduct) {
            normalizedProduct.id = productId++;
            products.push(normalizedProduct);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error extracting from ${fileName}:`, error);
  }
  
  return products;
}

/**
 * Processes a single JSON file with appropriate extractor
 */
function processJSONFile(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const fileName = path.basename(filePath, '.json');
    
    let products = [];
    
    // Use appropriate extractor based on file name
    if (fileName.toLowerCase().includes('dyna') || fileName.toLowerCase().includes('metal pen')) {
      products = extractFromDynaCatalog(data, fileName);
    } else if (fileName.toLowerCase().includes('household')) {
      products = extractFromHouseholdCatalog(data, fileName);
    } else if (fileName.toLowerCase().includes('saran')) {
      products = extractFromSaranCatalog(data, fileName);
    } else if (fileName.toLowerCase().includes('ojas') || fileName.toLowerCase().includes('kitchen')) {
      products = extractFromOjasCatalog(data, fileName);
    } else if (fileName.toLowerCase().includes('products1') || fileName.toLowerCase().includes('products2')) {
      products = extractFromProductsDataCatalog(data, fileName);
    } else {
      products = extractFromGenericCatalog(data, fileName);
    }
    
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
  console.log('Starting enhanced catalog conversion...');
  console.log(`Looking for JSON files in multiple directories...`);
  
  // Get all JSON files from all directories
  const files = [];
  const processedFiles = new Set(); // To avoid duplicates
  
  for (const catalogDir of CATALOG_DIRS) {
    console.log(`Checking directory: ${catalogDir}`);
    
    if (!fs.existsSync(catalogDir)) {
      console.warn(`Directory not found: ${catalogDir}`);
      continue;
    }
    
    const dirFiles = fs.readdirSync(catalogDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fullPath = path.join(catalogDir, file);
        const fileName = path.basename(file);
        
        // Avoid duplicates by checking file name and size
        const stats = fs.statSync(fullPath);
        const fileKey = `${fileName}-${stats.size}`;
        
        if (!processedFiles.has(fileKey)) {
          processedFiles.add(fileKey);
          return fullPath;
        }
        return null;
      })
      .filter(file => file !== null);
    
    files.push(...dirFiles);
    console.log(`  Found ${dirFiles.length} unique files in ${path.basename(catalogDir)}`);
  }
  
  console.log(`Found ${files.length} JSON files:`);
  files.forEach(file => console.log(`  - ${path.basename(file)}`));
  
  if (files.length === 0) {
    console.log('No JSON files found to convert.');
    return;
  }
  
  // Process all files
  const allProducts = [];
  
  for (const file of files) {
    const products = processJSONFile(file);
    allProducts.push(...products);
    
    // Save individual file CSV
    if (products.length > 0) {
      const fileName = path.basename(file, '.json');
      const csvFileName = path.join(OUTPUT_DIR, `${fileName}-categorized.csv`);
      const csvData = Papa.unparse(products, {
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
  
  // Sort products by category, subcategory, and name
  allProducts.sort((a, b) => {
    const aCat = String(a.category || '');
    const bCat = String(b.category || '');
    if (aCat !== bCat) {
      return aCat.localeCompare(bCat);
    }
    const aSubcat = String(a.subcategory || '');
    const bSubcat = String(b.subcategory || '');
    if (aSubcat !== bSubcat) {
      return aSubcat.localeCompare(bSubcat);
    }
    const aName = String(a.name || '');
    const bName = String(b.name || '');
    return aName.localeCompare(bName);
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
  
  console.log('\n=== Enhanced Conversion Complete ===');
  console.log(`Total products converted: ${allProducts.length}`);
  console.log(`Combined CSV saved to: ${path.basename(COMBINED_OUTPUT_FILE)}`);
  console.log(`Individual CSV files saved to: ${OUTPUT_DIR}`);
  
  // Show category breakdown
  const categoryCount = {};
  const subcategoryCount = {};
  
  allProducts.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    const key = `${product.category} > ${product.subcategory}`;
    subcategoryCount[key] = (subcategoryCount[key] || 0) + 1;
  });
  
  console.log('\n=== MAIN CATEGORIES ===');
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`${category}: ${count} products`);
    });
  
  console.log('\n=== TOP SUBCATEGORIES ===');
  Object.entries(subcategoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .forEach(([subcategory, count]) => {
      console.log(`${subcategory}: ${count} products`);
    });
  
  return {
    totalProducts: allProducts.length,
    categories: categoryCount,
    subcategories: subcategoryCount
  };
}

// Run the conversion
convertCatalogsToCSV();

export { convertCatalogsToCSV };