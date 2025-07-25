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

// Load Metal Pens catalog - Updated to group by name and series
const loadMetalPens = async (): Promise<CategoryData> => {
  try {
    const response = await fetch('/src/product-catalog/Dyna Metal Pen Catalog.json');
    if (!response.ok) {
      throw new Error('Failed to fetch Metal Pens catalog');
    }
    
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

// Load Kitchen World catalog - Updated to ensure all 7 categories are properly loaded
const loadKitchenWorld = async (): Promise<CategoryData> => {
  try {
    const response = await fetch('/src/product-catalog/OJAS Kitchen World Catalogue Products List .json');
    if (!response.ok) {
      throw new Error('Failed to fetch Kitchen World catalog');
    }
    
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
            Object.entries(product.items).forEach(([itemType, sizes]) => {
              features.push(`${itemType}: ${Array.isArray(sizes) ? sizes.join(', ') : 'Various sizes'}`);
            });
            newProduct.features = features;
          }
          
          // Add series if available (for Idli Pot)
          if (product.series) {
            const features: string[] = [];
            Object.entries(product.series).forEach(([seriesName, sizes]) => {
              features.push(`${seriesName}: ${Array.isArray(sizes) ? sizes.join(', ') : 'Various sizes'}`);
            });
            newProduct.features = features;
          }
          
          return newProduct;
        })
      };
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

// Load Household Products catalog - Updated to ensure all 16 categories are properly loaded
const loadHouseholdProducts = async (): Promise<CategoryData> => {
  try {
    const response = await fetch('/src/product-catalog/HouseHold Products.json');
    if (!response.ok) {
      throw new Error('Failed to fetch Household Products catalog');
    }
    
    const data = await response.json();
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = data.map((category: any, categoryIndex: number) => {
      return {
        name: category.category,
        products: category.products.map((product: any, productIndex: number) => {
          // Create base product
          const newProduct: Product = {
            id: `HP-${category.category.substring(0, 2).toUpperCase()}-${productIndex}`,
            name: product.series || `${category.category} Item ${productIndex + 1}`,
            category: 'Household Products',
            subcategory: category.category,
            description: product.description || `${product.series || category.category} with various options and sizes`,
          };
          
          // Add variants if available
          if (product.variants) {
            newProduct.variants = product.variants;
          }
          
          // Add features if available
          if (product.features) {
            newProduct.features = product.features;
          }
          
          // Add sizes if available
          if (product.sizes) {
            newProduct.sizes = product.sizes;
          }
          
          // Add capacities if available
          if (product.capacities) {
            newProduct.capacities = product.capacities;
          }
          
          return newProduct;
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

// Load Industrial Plastic Crates catalog - Updated to ensure all series are properly loaded
const loadPlasticCrates = async (): Promise<CategoryData> => {
  try {
    const response = await fetch('/src/product-catalog/Saran Enterprises catalog.json');
    if (!response.ok) {
      throw new Error('Failed to fetch Industrial Plastic Crates catalog');
    }
    
    const data = await response.json();
    
    // Find the main category for industrial plastic crates
    const cratesCategory = data.find((category: any) => 
      category.category === 'Industrial Plastic Crates'
    );
    
    if (!cratesCategory) {
      throw new Error('Industrial Plastic Crates category not found');
    }
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = cratesCategory.series.map((series: any, seriesIndex: number) => {
      return {
        name: series.name,
        products: series.variants.map((variant: any, variantIndex: number) => {
          // Create base product
          const newProduct: Product = {
            id: `IPC-${series.name.substring(0, 2).toUpperCase()}-${variantIndex}`,
            name: variant.name || `${series.name} - ${variant.outer_dimension || 'Standard Size'}`,
            category: 'Industrial Plastic Crates',
            subcategory: series.name,
            description: variant.description || `Industrial plastic crate with dimensions: ${variant.outer_dimension}`,
          };
          
          // Add dimensions and capacity if available
          if (variant.outer_dimension) {
            newProduct.outer_dimension = variant.outer_dimension;
          }
          
          if (variant.inner_dimension) {
            newProduct.inner_dimension = variant.inner_dimension;
          }
          
          if (variant.capacity_l) {
            newProduct.capacity_l = variant.capacity_l;
          } else if (variant.capacity) {
            newProduct.description += `. Capacity: ${variant.capacity}`;
          }
          
          return newProduct;
        })
      };
    });
    
    // Also include other categories from the Saran Enterprises catalog
    const otherCategories = data.filter((category: any) => 
      category.category !== 'Industrial Plastic Crates'
    );
    
    otherCategories.forEach((category: any, categoryIndex: number) => {
      // Prepare products based on the structure
      let products: Product[] = [];
      
      if (category.products) {
        products = category.products.map((product: any, productIndex: number) => {
          return {
            id: `OTH-${category.category.substring(0, 2).toUpperCase()}-${productIndex}`,
            name: product.name || `${category.category} Item ${productIndex + 1}`,
            category: 'Industrial Plastic Crates',
            subcategory: category.category,
            description: product.description || `${category.category} item with various specifications`,
            outer_dimension: product.outer_dimension,
            inner_dimension: product.inner_dimension,
          };
        });
      } else if (category.variants) {
        products = category.variants.map((variant: any, variantIndex: number) => {
          return {
            id: `OTH-${category.category.substring(0, 2).toUpperCase()}-${variantIndex}`,
            name: `${category.category} - Type ${variantIndex + 1}`,
            category: 'Industrial Plastic Crates',
            subcategory: category.category,
            description: variant.descriptions ? variant.descriptions.join('. ') : `${category.category} variant`,
            features: variant.features
          };
        });
      } else {
        // If no products or variants, create a single product
        products = [{
          id: `OTH-${category.category.substring(0, 2).toUpperCase()}-0`,
          name: category.category,
          category: 'Industrial Plastic Crates',
          subcategory: category.category,
          description: category.features ? category.features.join('. ') : `${category.category} products`,
          features: category.features
        }];
      }
      
      subcategories.push({
        name: category.category,
        products
      });
    });
    
    return {
      category: 'Industrial Plastic Crates',
      subcategories
    };
  } catch (error) {
    console.error('Error loading Industrial Plastic Crates catalog:', error);
    return {
      category: 'Industrial Plastic Crates',
      subcategories: []
    };
  }
};

// Load Other Products catalog - Updated to include all files: other.json, videos.json, products1.json
const loadOtherProducts = async (): Promise<CategoryData> => {
  try {
    // Load all sources
    const otherResponse = await fetch('/src/product-catalog/other.json');
    const videosResponse = await fetch('/src/product-catalog/videos.json');
    const products1Response = await fetch('/data/products1.json');
    const products2Response = await fetch('/data/products2.json');
    
    if (!otherResponse.ok || !videosResponse.ok || !products1Response.ok || !products2Response.ok) {
      throw new Error('Failed to fetch one or more Other Products catalogs');
    }
    
    const otherData = await otherResponse.json();
    const videosData = await videosResponse.json();
    const products1Data = await products1Response.json();
    const products2Data = await products2Response.json();
    
    const subcategories: SubcategoryData[] = [];
    
    // Process Other data (Premium Cookware)
    const otherProducts: Product[] = [];
    if (otherData.products) {
      otherData.products.forEach((product: any, index: number) => {
        const newProduct: Product = {
          id: `OTH-PC-${index}`,
          name: product.type,
          category: 'Other Products',
          subcategory: otherData.category,
          brand: otherData.brand,
          series: otherData.series,
          description: product.description || `${product.type} with premium tri-ply construction`,
          features: otherData.key_features
        };
        
        // Add sizes if available
        if (product.sizes_cm) {
          newProduct.sizes = product.sizes_cm.map((size: number) => `${size} cm`);
        } else if (product.sizes) {
          newProduct.sizes = product.sizes.map((size: any) => size.size);
        }
        
        otherProducts.push(newProduct);
      });
    }
    
    subcategories.push({
      name: otherData.category,
      products: otherProducts
    });
    
    // Process Videos data (Hotel Amenities)
    videosData.forEach((category: any) => {
      const products: Product[] = category.products.map((product: any, index: number) => {
        const newProduct: Product = {
          id: `OTH-${category.category.substring(0, 2).toUpperCase()}-${index}`,
          name: product.name,
          category: 'Other Products',
          subcategory: category.category,
          brand: category.brand || product.brand,
          description: product.description || `${product.name} for hospitality industry`,
        };
        
        // Add additional attributes
        if (product.packaging) {
          newProduct.packaging = typeof product.packaging === 'string' 
            ? product.packaging 
            : product.packaging.join(', ');
        }
        
        if (product.moq) {
          newProduct.moq = product.moq;
        }
        
        if (product.features) {
          newProduct.features = product.features;
        }
        
        if (product.colors) {
          newProduct.colors = product.colors;
        }
        
        if (product.variants) {
          newProduct.variants = product.variants;
        }
        
        return newProduct;
      });
      
      subcategories.push({
        name: category.category,
        products
      });
    });
    
    // Process Products1 data (various categories)
    const products1Map = new Map<string, any[]>();
    
    products1Data.forEach((product: any) => {
      if (!products1Map.has(product.type)) {
        products1Map.set(product.type, []);
      }
      products1Map.get(product.type)?.push(product);
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