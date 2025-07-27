import fs from 'fs';
import path from 'path';
import { convertProductsToCSV, extractProductsFromData, normalizeProduct } from './csvConverter';

// Function to read a JSON file
async function readJsonFile(filePath: string): Promise<any> {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to write a CSV file
async function writeCSVFile(filePath: string, data: string): Promise<void> {
  try {
    await fs.promises.writeFile(filePath, data, 'utf8');
    console.log(`CSV file saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

// Function to convert JSON data to CSV
function convertJsonToCSV(jsonData: any[]): string {
  // Collect all products from different JSON structures
  let allProducts: any[] = [];
  
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

// Main function to convert JSON catalog to CSV
async function convertCatalog(): Promise<void> {
  try {
    const catalogDir = path.join(process.cwd(), 'product-catalog');
    const outputDir = path.join(process.cwd(), 'csv-output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Get all JSON files in the catalog directory
    const files = fs.readdirSync(catalogDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} JSON files in ${catalogDir}`);
    
    // Read all JSON files
    const allData: any[] = [];
    for (const file of files) {
      const filePath = path.join(catalogDir, file);
      const data = await readJsonFile(filePath);
      if (data) {
        allData.push(data);
        console.log(`Successfully read ${file}`);
        
        // Extract products and save individual CSV for each file
        const extractedProducts = extractProductsFromData(data);
        console.log(`Extracted ${extractedProducts.length} products from ${file}`);
        
        // Save individual CSV
        const csvData = convertJsonToCSV([data]);
        const outputPath = path.join(outputDir, `${path.basename(file, '.json')}.csv`);
        await writeCSVFile(outputPath, csvData);
      }
    }
    
    // Convert all data to CSV
    const csvData = convertJsonToCSV(allData);
    const outputPath = path.join(outputDir, 'all-products.csv');
    await writeCSVFile(outputPath, csvData);
    
    console.log('Conversion completed successfully');
  } catch (error) {
    console.error('Error converting catalog:', error);
  }
}

// Run the conversion
convertCatalog().catch(console.error); 