import { parseCSVToProducts } from './csvConverter';
import { uploadProductsCSV } from '../services/productService';
import Papa from 'papaparse';

/**
 * Imports CSV data from a file into the application
 * @param file The CSV file to import
 * @returns Promise resolving to the number of products imported
 */
export async function importCsvFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result as string;
        if (!csvData) {
          reject(new Error('Failed to read CSV file'));
          return;
        }
        
        // Parse CSV data
        const parsedData = parseCSVToProducts(csvData);
        console.log(`Parsed ${parsedData.length} products from CSV`);
        
        // Upload to Supabase
        const csvString = Papa.unparse(parsedData, {
          header: true,
          delimiter: ",",
          newline: "\n",
          escapeChar: '"',
          quoteChar: '"',
          quotes: true
        });
        
        await uploadProductsCSV(csvString);
        resolve(parsedData.length);
      } catch (error) {
        console.error('Error importing CSV file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading CSV file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Imports CSV data from a string into the application
 * @param csvString The CSV data string to import
 * @returns Promise resolving to the number of products imported
 */
export async function importCsvString(csvString: string): Promise<number> {
  try {
    // Parse CSV data
    const parsedData = parseCSVToProducts(csvString);
    console.log(`Parsed ${parsedData.length} products from CSV string`);
    
    // Upload to Supabase
    await uploadProductsCSV(csvString);
    return parsedData.length;
  } catch (error) {
    console.error('Error importing CSV string:', error);
    throw error;
  }
} 