import { importProductsFromJson } from '../services/productService';

interface ProductData {
  [key: string]: any;
  name?: string;
  category?: string;
}

interface CategoryData {
  category?: string;
  products?: ProductData[];
  [key: string]: any;
}

/**
 * Imports products from JSON files in the product-catalog directory
 * This is a utility function to help import existing JSON files
 */
export async function importProductsFromCatalog(): Promise<void> {
  try {
    // Try to import each catalog file
    const catalogFiles = [
      '/product-catalog/Dyna Metal Pen Catalog.json',
      '/product-catalog/OJAS Kitchen World Catalogue Products List .json',
      '/product-catalog/HouseHold Products.json',
      '/product-catalog/Saran Enterprises catalog.json',
      '/product-catalog/other.json'
    ];

    for (const file of catalogFiles) {
      try {
        const response = await fetch(file);
        if (!response.ok) {
          console.warn(`Failed to fetch ${file}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        console.log(`Successfully loaded ${file}, importing data...`);
        
        // Transform data if needed based on the file structure
        let productsData: ProductData[];
        
        // Handle different file structures
        if (Array.isArray(data)) {
          // Direct array of products or categories
          if (data.length > 0 && data[0].products) {
            // Array of categories with products
            const allProducts: ProductData[] = [];
            for (const category of data as CategoryData[]) {
              if (category.products && Array.isArray(category.products)) {
                for (const product of category.products) {
                  allProducts.push({
                    ...product,
                    category: category.category || 'Uncategorized'
                  });
                }
              }
            }
            productsData = allProducts;
          } else {
            // Direct array of products
            productsData = data as ProductData[];
          }
        } else if (data.products && Array.isArray(data.products)) {
          // Single category with products array
          const categoryData = data as CategoryData;
          // Check if products exists before mapping
          if (categoryData.products) {
            productsData = categoryData.products.map(product => ({
              ...product,
              category: categoryData.category || 'Uncategorized'
            }));
          } else {
            console.warn(`No products array found in ${file}`);
            continue;
          }
        } else {
          console.warn(`Unsupported data structure in ${file}`);
          continue;
        }
        
        // Import the products
        await importProductsFromJson(productsData);
        console.log(`Successfully imported products from ${file}`);
      } catch (error) {
        console.error(`Error importing from ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error importing products from catalog:', error);
    throw error;
  }
} 