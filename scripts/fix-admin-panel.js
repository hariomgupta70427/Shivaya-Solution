import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read a CSV file
async function readCSVFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
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

// Function to parse CSV data
function parseCSV(csvData) {
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
  
  return result.data;
}

// Function to convert products to CSV
function convertToCSV(products) {
  return Papa.unparse(products, {
    header: true,
    delimiter: ',',
    newline: '\n',
    escapeChar: '"',
    quoteChar: '"',
    quotes: true
  });
}

// Function to remove unnamed products from CSV data
function removeUnnamedProducts(products) {
  const filteredProducts = products.filter(product => {
    const name = product.name || '';
    return name.trim() !== '' && name !== 'Unnamed Product';
  });
  
  console.log(`Removed ${products.length - filteredProducts.length} unnamed products`);
  
  return filteredProducts;
}

// Function to fix category and subcategory fields
function fixCategoryFields(products) {
  return products.map(product => {
    // Ensure category is never empty
    if (!product.category || product.category.trim() === '') {
      product.category = 'Uncategorized';
    }
    
    // Ensure subcategory is a string
    if (product.subcategory === null || product.subcategory === undefined) {
      product.subcategory = '';
    }
    
    return product;
  });
}

// Main function to fix CSV files
async function fixCSVFiles() {
  try {
    const rootDir = path.resolve(path.join(__dirname, '..'));
    const csvOutputDir = path.join(rootDir, 'csv-output');
    const publicCsvOutputDir = path.join(rootDir, 'public', 'csv-output');
    
    // Create output directories if they don't exist
    if (!fs.existsSync(publicCsvOutputDir)) {
      fs.mkdirSync(publicCsvOutputDir, { recursive: true });
    }
    
    // Get all CSV files in the output directory
    const files = fs.readdirSync(csvOutputDir)
      .filter(file => file.endsWith('.csv'));
    
    console.log(`Found ${files.length} CSV files in ${csvOutputDir}`);
    
    // Process each CSV file
    for (const file of files) {
      const filePath = path.join(csvOutputDir, file);
      const csvData = await readCSVFile(filePath);
      
      if (csvData) {
        console.log(`Processing ${file}...`);
        
        // Parse CSV data
        const products = parseCSV(csvData);
        console.log(`Found ${products.length} products in ${file}`);
        
        // Remove unnamed products
        const filteredProducts = removeUnnamedProducts(products);
        
        // Fix category fields
        const fixedProducts = fixCategoryFields(filteredProducts);
        
        // Convert back to CSV
        const newCsvData = convertToCSV(fixedProducts);
        
        // Save to original location
        await writeCSVFile(filePath, newCsvData);
        
        // Also save to public directory
        const publicFilePath = path.join(publicCsvOutputDir, file);
        await writeCSVFile(publicFilePath, newCsvData);
        
        console.log(`Fixed ${file} with ${fixedProducts.length} products`);
      }
    }
    
    console.log('All CSV files processed successfully');
  } catch (error) {
    console.error('Error fixing CSV files:', error);
  }
}

// Run the script
fixCSVFiles().catch(console.error); 