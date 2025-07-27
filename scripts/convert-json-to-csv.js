// Simple script to convert JSON files to CSV
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure the csv-output directory exists
const outputDir = path.join(projectRoot, 'csv-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Define catalog directory
const catalogDir = path.join(projectRoot, 'product-catalog');

console.log('Converting JSON files to CSV...');

// Function to normalize product data
function normalizeProduct(product) {
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

// Function to extract products from different JSON structures
function extractProductsFromData(data) {
  // Case 1: Direct array of products
  if (Array.isArray(data)) {
    if (data.length > 0) {
      if (!data[0].products) {
        return data;
      } else {
        // Case 2: Array of categories with products
        let allProducts = [];
        data.forEach(category => {
          if (category.products && Array.isArray(category.products)) {
            const productsWithCategory = category.products.map(product => ({
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
    return data.products.map(product => ({
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

// Function to convert JSON data to CSV
function convertJsonToCSV(jsonData) {
  // Collect all products from different JSON structures
  let allProducts = [];
  
  jsonData.forEach(data => {
    try {
      const extractedProducts = extractProductsFromData(data);
      const normalizedProducts = extractedProducts.map(item => normalizeProduct(item));
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
  
  console.log(`Converted ${allProducts.length} products to CSV`);
  
  // Convert to CSV using Papa Parse
  return Papa.unparse(allProducts, {
    header: true,
    delimiter: ",",
    newline: "\n",
    escapeChar: '"',
    quoteChar: '"',
    quotes: true
  });
}

// Main function to convert JSON catalog to CSV
async function convertCatalog() {
  try {
    // Get all JSON files in the catalog directory
    const files = fs.readdirSync(catalogDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} JSON files in ${catalogDir}`);
    
    // Read all JSON files
    const allData = [];
    for (const file of files) {
      try {
        const filePath = path.join(catalogDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        
        allData.push(jsonData);
        console.log(`Successfully read ${file}`);
        
        // Extract products and save individual CSV for each file
        const extractedProducts = extractProductsFromData(jsonData);
        console.log(`Extracted ${extractedProducts.length} products from ${file}`);
        
        // Save individual CSV
        const csvData = convertJsonToCSV([jsonData]);
        const outputPath = path.join(outputDir, `${path.basename(file, '.json')}.csv`);
        fs.writeFileSync(outputPath, csvData, 'utf8');
        console.log(`CSV file saved to ${outputPath}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
    
    // Convert all data to CSV
    const csvData = convertJsonToCSV(allData);
    const outputPath = path.join(outputDir, 'all-products.csv');
    fs.writeFileSync(outputPath, csvData, 'utf8');
    console.log(`All products CSV file saved to ${outputPath}`);
    
    console.log('Conversion completed successfully');
  } catch (error) {
    console.error('Error converting catalog:', error);
  }
}

// Run the conversion
convertCatalog().catch(console.error); 