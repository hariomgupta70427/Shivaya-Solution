import { Product } from '../hooks/useProducts';

// --- CATEGORY & SUBCATEGORY STRUCTURE ---
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Metal Pens': 'cat_metal_pens',
  'Household Products': 'cat_household_products',
  'Kitchen World': 'cat_kitchen_world',
  'Industrial Plastic Crates': 'cat_plastic_crates',
  'Other Products': 'cat_other_products',
};

// Function to generate dynamic, contextually relevant image URLs
export const generateProductImageUrl = (product: Product): string => {
  // Create a query string from product details
  const queryParts: string[] = [];
  
  // Add product name
  if (product.name) {
    queryParts.push(product.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ','));
  }
  
  // Add category or material
  if (product.category) {
    queryParts.push(product.category.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ','));
  } else if (product.material) {
    queryParts.push(product.material.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ','));
  }
  
  // Add series if available
  if (product.series) {
    queryParts.push(product.series.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ','));
  }
  
  // Filter out any empty parts and join with commas
  const queryString = queryParts.filter(part => part.trim() !== '').join(',');
  
  // Generate and return the image URL
  return `https://source.unsplash.com/featured/?${queryString}`;
};

// Data interfaces
export interface ProductVariant {
  model?: string;
  name?: string;
  size?: string;
  color?: string;
  capacity?: string | number;
  description?: string;
  outer_dimension?: string;
  inner_dimension?: string;
  capacity_l?: number;
}

export interface SubcategoryData {
  name: string;
  products: Product[];
  image?: string;
}

export interface CategoryData {
  category: string;
  subcategories: SubcategoryData[];
  banner?: string;
}

// Helper function to generate a unique ID
const generateId = (category: string, subcategory: string, name: string, index: number): string => {
  const categoryPrefix = category.substring(0, 2).toUpperCase();
  const subcategoryPrefix = subcategory.substring(0, 2).toUpperCase();
  return `${categoryPrefix}-${subcategoryPrefix}-${index.toString().padStart(3, '0')}`;
};

// Helper to group products by name (for Metal Pens)
const groupProductsByName = (products: any[]): Product[] => {
  const groupedMap = new Map<string, any[]>();
  
  // Group products by name
  products.forEach(product => {
    if (!groupedMap.has(product.name)) {
      groupedMap.set(product.name, []);
    }
    groupedMap.get(product.name)?.push(product);
  });
  
  // Convert grouped map to products array
  return Array.from(groupedMap.entries()).map(([name, models], index) => {
    const modelNumbers = models.map((m: any) => m.model).join(', ');
    const modelCount = models.length;
    
    return {
      id: `MP-${name.substring(0, 2).toUpperCase()}-${index}`,
      name: name,
      category: 'Metal Pens',
      subcategory: models[0].subcategory || models[0].series,
      series: models[0].series,
      material: 'Metal',
      description: `Premium ${name} metal pen${modelCount > 1 ? `. Includes ${modelCount} models: ${modelNumbers}` : ''}`,
      features: [
        'Smooth writing experience',
        'Premium metal construction',
        'Professional design'
      ],
      models: models.map((m: any) => ({ model_no: m.model, name: m.name }))
    };
  });
};

// Helper function to fetch from multiple possible paths
async function fetchWithFallback(paths: string[]): Promise<Response> {
  let lastError: Error | null = null;
  
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Failed to fetch from ${path}:`, error);
    }
  }
  
  throw lastError || new Error('Failed to fetch from all paths');
}

// Update Metal Pens catalog loader
const loadMetalPens = async (): Promise<CategoryData> => {
  try {
    const response = await fetchWithFallback([
      '/product-catalog/Dyna Metal Pen Catalog.json',
      '/src/product-catalog/Dyna Metal Pen Catalog.json',
      './src/product-catalog/Dyna Metal Pen Catalog.json'
    ]);
    
    const data = await response.json();
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = data.map((series: any) => {
      // Group products by name within each series
      const groupedProducts = groupProductsByName(series.products.map((product: any) => ({
        ...product,
        series: series.series,
        subcategory: series.series
      })));
      
      return {
        name: series.series,
        products: groupedProducts
      };
    });
    
    return {
      category: 'Metal Pens',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Metal Pens catalog:', error);
    return {
      category: 'Metal Pens',
      subcategories: []
    };
  }
};

// Update Kitchen World catalog loader
const loadKitchenWorld = async (): Promise<CategoryData> => {
  try {
    const response = await fetchWithFallback([
      '/product-catalog/OJAS Kitchen World Catalogue Products List .json',
      '/src/product-catalog/OJAS Kitchen World Catalogue Products List .json',
      './src/product-catalog/OJAS Kitchen World Catalogue Products List .json'
    ]);
    
    const data = await response.json();
    
    // Group products by category
    const categoryMap = new Map<string, any[]>();
    
    data.forEach((product: any) => {
      const category = product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push(product);
    });
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = Array.from(categoryMap.entries()).map(([category, products], categoryIndex) => {
      return {
        name: category,
        products: products.map((product, index) => {
          // Create a product object with the appropriate structure
          const newProduct: Product = {
            id: `KW-${category.substring(0, 2).toUpperCase()}-${index}`,
            name: product.name,
            category: 'Kitchen World',
            subcategory: category,
            material: product.material || '',
            description: product.description || '',
          };
          
          // Add sizes if available
          if (product.available_sizes) {
            newProduct.sizes = product.available_sizes;
          }
          
          // Add models if available
          if (product.models) {
            newProduct.models = product.models;
          }
          
          // Add variants if available
          if (product.variants) {
            newProduct.variants = product.variants;
          }
          
          // Add items if available (for Cookware Set)
          if (product.items) {
            const features: string[] = [];
            features.push(`Includes ${product.items.length} items`);
            product.items.forEach((item: string) => {
              features.push(item);
            });
            newProduct.features = features;
          }
          
          return newProduct;
        })
      };
    });
    
    // Ensure all 7 categories are present
    const requiredCategories = [
      'Pressure Cooker', 
      'Gas Stove', 
      'Thermoware', 
      'Cookware', 
      'Idli Pot', 
      'Bati Bartan', 
      'Barbeque'
    ];
    
    // Add missing categories with empty product arrays
    requiredCategories.forEach(category => {
      if (!subcategories.some(sub => sub.name === category)) {
        subcategories.push({
          name: category,
          products: []
        });
      }
    });
    
    return {
      category: 'Kitchen World',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Kitchen World catalog:', error);
    return {
      category: 'Kitchen World',
      subcategories: []
    };
  }
};

// Update Household Products catalog loader
const loadHouseholdProducts = async (): Promise<CategoryData> => {
  try {
    const response = await fetchWithFallback([
      '/product-catalog/HouseHold Products.json',
      '/src/product-catalog/HouseHold Products.json',
      './src/product-catalog/HouseHold Products.json'
    ]);
    
    const data = await response.json();
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = data.map((category: any) => {
      return {
        name: category.category,
        products: category.products.map((product: any, index: number) => {
          return {
            id: generateId('HP', category.category, product.name, index),
            name: product.name,
            category: 'Household Products',
            subcategory: category.category,
            description: product.description || `${product.name} - ${category.category}`,
            material: product.material || 'Plastic',
            variants: product.variants || [],
            colors: product.colors || [],
            sizes: product.sizes || []
          };
        })
      };
    });
    
    return {
      category: 'Household Products',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Household Products catalog:', error);
    return {
      category: 'Household Products',
      subcategories: []
    };
  }
};

// Update Plastic Crates catalog loader
const loadPlasticCrates = async (): Promise<CategoryData> => {
  try {
    const response = await fetchWithFallback([
      '/product-catalog/Saran Enterprises catalog.json',
      '/src/product-catalog/Saran Enterprises catalog.json',
      './src/product-catalog/Saran Enterprises catalog.json'
    ]);
    
    const data = await response.json();
    
    // Group products by series
    const seriesMap = new Map<string, any[]>();
    
    data.forEach((product: any) => {
      // Extract series from dimensions (e.g., "300x200" from "300x200x120")
      let series = '';
      
      if (product.outer_dimension) {
        const dimensions = product.outer_dimension.split('x');
        if (dimensions.length >= 2) {
          series = `${dimensions[0]}x${dimensions[1]} Series`;
        }
      }
      
      if (!series) {
        series = 'Other Crates';
      }
      
      if (!seriesMap.has(series)) {
        seriesMap.set(series, []);
      }
      
      seriesMap.get(series)?.push(product);
    });
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = Array.from(seriesMap.entries()).map(([series, products]) => {
      return {
        name: series,
        products: products.map((product, index) => {
          // Create a product object with the appropriate structure
          const productName = product.name || `Crate ${product.outer_dimension || ''}`;
          
          const newProduct: Product = {
            id: `PC-${series.substring(0, 2).toUpperCase()}-${index}`,
            name: productName,
            category: 'Industrial Plastic Crates',
            subcategory: series,
            description: product.description || `Industrial plastic crate with dimensions ${product.outer_dimension || 'various'}.`,
            outer_dimension: product.outer_dimension,
            inner_dimension: product.inner_dimension,
            capacity_l: product.capacity_l,
            material: 'Industrial Plastic',
          };
          
          // Add variants if available
          if (product.variants) {
            newProduct.variants = product.variants;
          }
          
          // Add colors if available
          if (product.colors) {
            newProduct.colors = product.colors;
          }
          
          // Add packaging if available
          if (product.packaging) {
            newProduct.packaging = product.packaging;
          }
          
          return newProduct;
        })
      };
    });
    
    return {
      category: 'Industrial Plastic Crates',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Plastic Crates catalog:', error);
    return {
      category: 'Industrial Plastic Crates',
      subcategories: []
    };
  }
};

// Update Other Products catalog loader
const loadOtherProducts = async (): Promise<CategoryData> => {
  try {
    // Load data from multiple sources
    const [otherResponse, videosResponse, products1Response, products2Response] = await Promise.all([
      fetchWithFallback([
        '/product-catalog/other.json',
        '/src/product-catalog/other.json',
        './src/product-catalog/other.json'
      ]),
      fetchWithFallback([
        '/product-catalog/videos.json',
        '/src/product-catalog/videos.json',
        './src/product-catalog/videos.json'
      ]),
      fetchWithFallback([
        '/data/products1.json',
        './public/data/products1.json'
      ]),
      fetchWithFallback([
        '/data/products2.json',
        './public/data/products2.json'
      ])
    ]);
    
    const otherData = await otherResponse.json();
    const videosData = await videosResponse.json();
    const products1Data = await products1Response.json();
    const products2Data = await products2Response.json();
    
    // Group all products by type/category
    const subcategories: SubcategoryData[] = [];
    
    // Process Other data
    const otherMap = new Map<string, any[]>();
    
    otherData.forEach((product: any) => {
      const type = product.type || 'Miscellaneous';
      if (!otherMap.has(type)) {
        otherMap.set(type, []);
      }
      otherMap.get(type)?.push(product);
    });
    
    otherMap.forEach((products, type) => {
      const typeProducts: Product[] = products.map((product, index) => {
        return {
          id: `OTH-${type.substring(0, 2).toUpperCase()}-${index}`,
          name: product.name,
          category: 'Other Products',
          subcategory: type,
          description: product.description || `${product.name} - ${type}`,
          features: product.features
        };
      });
      
      subcategories.push({
        name: type,
        products: typeProducts
      });
    });
    
    // Process Videos data
    const videosMap = new Map<string, any[]>();
    
    videosData.forEach((product: any) => {
      const type = product.type || 'Videos';
      if (!videosMap.has(type)) {
        videosMap.set(type, []);
      }
      videosMap.get(type)?.push(product);
    });
    
    videosMap.forEach((products, type) => {
      const typeProducts: Product[] = products.map((product, index) => {
        return {
          id: `VID-${type.substring(0, 2).toUpperCase()}-${index}`,
          name: product.name,
          category: 'Other Products',
          subcategory: type,
          description: product.description || `${product.name} - ${type}`,
          features: product.features
        };
      });
      
      subcategories.push({
        name: type,
        products: typeProducts
      });
    });
    
    // Process Products1 data (various categories)
    const products1Map = new Map<string, any[]>();
    
    products1Data.forEach((product: any) => {
      const type = product.type || 'General Products';
      if (!products1Map.has(type)) {
        products1Map.set(type, []);
      }
      products1Map.get(type)?.push(product);
    });
    
    products1Map.forEach((products, type) => {
      const typeProducts: Product[] = products.map((product, index) => {
        return {
          id: `OTH-${type.substring(0, 2).toUpperCase()}-${index}`,
          name: product.name,
          category: 'Other Products',
          subcategory: type,
          description: product.description || `${product.name} - ${type}`,
          tags: product.tags
        };
      });
      
      subcategories.push({
        name: type,
        products: typeProducts
      });
    });

    // Process Products2 data (various categories)
    const products2Map = new Map<string, any[]>();

    products2Data.forEach((product: any) => {
      if (!products2Map.has(product.type)) {
        products2Map.set(product.type, []);
      }
      products2Map.get(product.type)?.push(product);
    });

    products2Map.forEach((products, type) => {
      const typeProducts: Product[] = products.map((product, index) => {
        return {
          id: `OTH-${type.substring(0, 2).toUpperCase()}-${index}`,
          name: product.name,
          category: 'Other Products',
          subcategory: type,
          description: product.description || `${product.name} - ${type}`,
          tags: product.tags
        };
      });
      
      subcategories.push({
        name: type,
        products: typeProducts
      });
    });
    
    return {
      category: 'Other Products',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Other Products catalog:', error);
    return {
      category: 'Other Products',
      subcategories: []
    };
  }
};

// Main loader function
export async function loadProducts() {
  try {
    // Load all product categories in parallel
    const [metalPens, kitchenWorld, householdProducts, plasticCrates, otherProducts] = await Promise.all([
      loadMetalPens(),
      loadKitchenWorld(),
      loadHouseholdProducts(),
      loadPlasticCrates(),
      loadOtherProducts()
    ]);
    
    // Combine all categories
    const catalog: CategoryData[] = [
      metalPens,
      kitchenWorld,
      householdProducts,
      plasticCrates,
      otherProducts
    ];
    
    // Add dynamic image URLs
    catalog.forEach((category: CategoryData) => {
      const categoryImageKey = CATEGORY_IMAGE_MAP[category.category];
      category.banner = `https://source.unsplash.com/featured/?${category.category.toLowerCase().replace(/\s+/g, ',')}`;
      
      category.subcategories.forEach((subcategory: SubcategoryData) => {
        subcategory.image = `https://source.unsplash.com/featured/?${subcategory.name.toLowerCase().replace(/\s+/g, ',')},${category.category.toLowerCase().replace(/\s+/g, ',')}`;
        
        subcategory.products.forEach((product: Product) => {
          if (!product.image) {
            product.image = generateProductImageUrl(product);
          }
        });
      });
    });
    
    return catalog;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
} 