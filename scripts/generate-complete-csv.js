import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read a JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to write a CSV file
async function writeCSVFile(filePath, data) {
  try {
    await fs.promises.writeFile(filePath, data, 'utf8');
    console.log(`CSV file saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

// Normalize product data
function normalizeProduct(product, categoryOverride) {
  const now = new Date().toISOString();
  
  // Skip products with no name
  const productName = product.name || product.product_name || product.title || '';
  if (!productName.trim()) {
    return null; // Skip this product
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

// Extract products from various JSON structures
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

// Convert products to CSV
function convertProductsToCSV(products) {
  return Papa.unparse(products, {
    header: true,
    delimiter: ",",
    newline: "\n",
    escapeChar: '"',
    quoteChar: '"',
    quotes: true  // Always quote fields to avoid parsing issues
  });
}

// Main function to convert JSON catalog to CSV
async function convertCatalog() {
  try {
    // Use path.resolve to get absolute paths
    const rootDir = path.resolve(path.join(__dirname, '..'));
    const catalogDir = path.join(rootDir, 'src/product-catalog');
    const outputDir = path.join(rootDir, 'csv-output');
    
    console.log(`Root directory: ${rootDir}`);
    console.log(`Catalog directory: ${catalogDir}`);
    console.log(`Output directory: ${outputDir}`);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Get all JSON files in the catalog directory
    const files = fs.readdirSync(catalogDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} JSON files in ${catalogDir}`);
    
    // Read all JSON files
    const allData = [];
    for (const file of files) {
      const filePath = path.join(catalogDir, file);
      const data = await readJsonFile(filePath);
      if (data) {
        allData.push({file, data});
        console.log(`Successfully read ${file}`);
      }
    }
    
    // Extract all products
    let allProducts = [];
    for (const {file, data} of allData) {
      const extractedProducts = extractProductsFromJSON(data, file);
      allProducts = [...allProducts, ...extractedProducts];
      console.log(`Extracted ${extractedProducts.length} products from ${file}`);
    }
    
    // Sort products by category for better organization
    allProducts.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return 0;
    });
    
    // Assign IDs sequentially
    allProducts = allProducts.map((product, index) => ({
      ...product,
      id: index + 1
    }));
    
    // Convert to CSV
    const csvData = convertProductsToCSV(allProducts);
    const outputPath = path.join(outputDir, 'all-products-complete.csv');
    await writeCSVFile(outputPath, csvData);
    
    console.log(`Conversion completed successfully. Total products: ${allProducts.length}`);
  } catch (error) {
    console.error('Error converting catalog:', error);
  }
}

// Run the conversion
convertCatalog().catch(console.error); 