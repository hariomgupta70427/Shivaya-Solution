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
  let errors: string[] = [];
  
  console.log('Attempting to fetch from paths:', paths);
  
  for (const path of paths) {
    try {
      console.log(`Fetching from: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        console.log(`Successfully fetched from: ${path}`);
        return response;
      } else {
        const errorMsg = `Failed to fetch from ${path}: Status ${response.status}`;
        console.warn(errorMsg);
        errors.push(errorMsg);
      }
    } catch (error) {
      lastError = error as Error;
      const errorMsg = `Error fetching from ${path}: ${(error as Error).message}`;
      console.warn(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  const errorMessage = `Failed to fetch from all paths: ${errors.join('; ')}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Update Metal Pens catalog loader
const loadMetalPens = async (): Promise<CategoryData> => {
  try {
    const response = await fetchWithFallback([
      '/product-catalog/Dyna Metal Pen Catalog.json',
      '/src/product-catalog/Dyna Metal Pen Catalog.json',
      './src/product-catalog/Dyna Metal Pen Catalog.json',
      '../product-catalog/Dyna Metal Pen Catalog.json',
      './product-catalog/Dyna Metal Pen Catalog.json'
    ]);
    
    const data = await response.json();
    console.log('Parsed Metal Pens data:', data.length, 'series');
    
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
    
    console.log('Transformed Metal Pens data:', subcategories.length, 'subcategories');
    
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
      './src/product-catalog/OJAS Kitchen World Catalogue Products List .json',
      '../product-catalog/OJAS Kitchen World Catalogue Products List .json',
      './product-catalog/OJAS Kitchen World Catalogue Products List .json'
    ]);
    
    const data = await response.json();
    console.log('Parsed Kitchen World data:', data.length, 'items');
    
    // Group products by category
    const categoryMap = new Map<string, any[]>();
    
    data.forEach((product: any) => {
      const category = product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push(product);
    });
    
    console.log('Kitchen World categories:', Array.from(categoryMap.keys()));
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = Array.from(categoryMap.entries()).map(([category, products]) => {
      const categoryProducts: Product[] = [];
      
      products.forEach((product, index) => {
        // Handle products with models (create separate product for each model)
        if (product.models && Array.isArray(product.models)) {
          product.models.forEach((model: any, modelIndex: number) => {
            categoryProducts.push({
              id: `KW-${category.substring(0, 2).toUpperCase()}-${index}-${modelIndex}`,
              name: `${product.name} - ${model.name}`,
              category: 'Kitchen World',
              subcategory: category,
              material: product.material || '',
              description: `${product.description || ''} Model: ${model.model_no} - ${model.name}`,
              models: [model],
              series: product.name
            });
          });
        }
        // Handle products with available_sizes (create separate product for each size)
        else if (product.available_sizes && Array.isArray(product.available_sizes)) {
          product.available_sizes.forEach((size: string, sizeIndex: number) => {
            categoryProducts.push({
              id: `KW-${category.substring(0, 2).toUpperCase()}-${index}-${sizeIndex}`,
              name: `${product.name} - ${size}`,
              category: 'Kitchen World',
              subcategory: category,
              material: product.material || '',
              description: `${product.description || ''} Size: ${size}`,
              sizes: [size],
              series: product.name
            });
          });
        }
        // Handle products with items (like cookware sets)
        else if (product.items && Array.isArray(product.items)) {
          categoryProducts.push({
            id: `KW-${category.substring(0, 2).toUpperCase()}-${index}`,
            name: product.name,
            category: 'Kitchen World',
            subcategory: category,
            material: product.material || '',
            description: product.description || '',
            features: [`Includes ${product.items.length} items`, ...product.items]
          });
        }
        // Handle regular products
        else {
          categoryProducts.push({
            id: `KW-${category.substring(0, 2).toUpperCase()}-${index}`,
            name: product.name,
            category: 'Kitchen World',
            subcategory: category,
            material: product.material || '',
            description: product.description || '',
            variants: product.variants || []
          });
        }
      });
      
      return {
        name: category,
        products: categoryProducts
      };
    });
    
    console.log('Transformed Kitchen World data:', subcategories.length, 'subcategories');
    subcategories.forEach(sub => {
      console.log(`  - ${sub.name}: ${sub.products.length} products`);
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
      './src/product-catalog/HouseHold Products.json',
      '../product-catalog/HouseHold Products.json',
      './product-catalog/HouseHold Products.json'
    ]);
    
    const data = await response.json();
    console.log('Parsed Household Products data:', data.length, 'categories');
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = data.map((category: any) => {
      const products: Product[] = [];
      
      // Process each product series in the category
      category.products.forEach((productSeries: any, seriesIndex: number) => {
        if (productSeries.variants && Array.isArray(productSeries.variants)) {
          // Create individual products from variants
          productSeries.variants.forEach((variant: string, variantIndex: number) => {
            const seriesName = productSeries.series || 'General';
            products.push({
              id: generateId('HP', category.category, seriesName, seriesIndex * 100 + variantIndex),
              name: variant,
              category: 'Household Products',
              subcategory: category.category,
              description: productSeries.series 
                ? `${variant} from ${productSeries.series} series - ${category.category}`
                : `${variant} - ${category.category}`,
              material: productSeries.material || 'Plastic',
              series: productSeries.series,
              features: productSeries.features || []
            });
          });
        } else if (productSeries.name) {
          // Handle products with direct name property
          products.push({
            id: generateId('HP', category.category, productSeries.name, seriesIndex),
            name: productSeries.name,
            category: 'Household Products',
            subcategory: category.category,
            description: productSeries.description || `${productSeries.name} - ${category.category}`,
            material: productSeries.material || 'Plastic',
            variants: productSeries.variants || [],
            colors: productSeries.colors || [],
            sizes: productSeries.sizes || []
          });
        } else if (productSeries.series) {
          // Handle products with only series name (no variants)
          products.push({
            id: generateId('HP', category.category, productSeries.series, seriesIndex),
            name: productSeries.series,
            category: 'Household Products',
            subcategory: category.category,
            description: `${productSeries.series} series - ${category.category}`,
            material: productSeries.material || 'Plastic',
            series: productSeries.series,
            features: productSeries.features || []
          });
        }
      });
      
      return {
        name: category.category,
        products: products
      };
    });
    
    console.log('Transformed Household Products data:', subcategories.length, 'subcategories');
    subcategories.forEach(sub => {
      console.log(`  - ${sub.name}: ${sub.products.length} products`);
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
      './src/product-catalog/Saran Enterprises catalog.json',
      '../product-catalog/Saran Enterprises catalog.json',
      './product-catalog/Saran Enterprises catalog.json'
    ]);
    
    const data = await response.json();
    console.log('Parsed Plastic Crates data:', data.length, 'categories');
    
    // Transform data to fit our schema
    const subcategories: SubcategoryData[] = [];
    
    data.forEach((categoryData: any, categoryIndex: number) => {
      const categoryName = categoryData.category;
      const products: Product[] = [];
      
      // Handle different category structures
      if (categoryData.series && Array.isArray(categoryData.series)) {
        // Handle categories with series (like Industrial Plastic Crates)
        categoryData.series.forEach((series: any, seriesIndex: number) => {
          if (series.variants && Array.isArray(series.variants)) {
            series.variants.forEach((variant: any, variantIndex: number) => {
              let productName = series.name;
              let description = `${series.name} - Industrial plastic crate`;
              
              if (variant.outer_dimension) {
                productName += ` - ${variant.outer_dimension}`;
                description += ` with dimensions ${variant.outer_dimension}`;
              }
              
              if (variant.capacity_l) {
                description += ` and capacity ${variant.capacity_l}L`;
              } else if (variant.capacity) {
                description += ` for ${variant.capacity}`;
              }
              
              products.push({
                id: `PC-${categoryIndex}-${seriesIndex}-${variantIndex}`,
                name: productName,
                category: 'Industrial Plastic Crates',
                subcategory: categoryName,
                description: description,
                outer_dimension: variant.outer_dimension,
                inner_dimension: variant.inner_dimension,
                capacity_l: variant.capacity_l,
                capacity: variant.capacity,
                material: 'Industrial Plastic',
                series: series.name
              });
            });
          }
        });
      } else if (categoryData.variants && Array.isArray(categoryData.variants)) {
        // Handle categories with direct variants (like Waste Bins & Dustbins)
        categoryData.variants.forEach((variant: any, variantIndex: number) => {
          if (variant.capacities_l && Array.isArray(variant.capacities_l)) {
            // Handle variants with multiple capacities
            variant.capacities_l.forEach((capacity: number, capIndex: number) => {
              const colors = variant.colors || [];
              if (colors.length > 0) {
                colors.forEach((color: string, colorIndex: number) => {
                  products.push({
                    id: `PC-${categoryIndex}-${variantIndex}-${capIndex}-${colorIndex}`,
                    name: `${variant.type} ${categoryName.replace('Waste Bins & ', '')} - ${capacity}L - ${color}`,
                    category: 'Industrial Plastic Crates',
                    subcategory: categoryName,
                    description: `${variant.type} ${categoryName.toLowerCase()} with ${capacity}L capacity in ${color} color`,
                    capacity_l: capacity,
                    material: variant.material || 'HDPE',
                    colors: [color],
                    features: variant.features || [],
                    type: variant.type
                  });
                });
              } else {
                products.push({
                  id: `PC-${categoryIndex}-${variantIndex}-${capIndex}`,
                  name: `${variant.type} ${categoryName.replace('Waste Bins & ', '')} - ${capacity}L`,
                  category: 'Industrial Plastic Crates',
                  subcategory: categoryName,
                  description: `${variant.type} ${categoryName.toLowerCase()} with ${capacity}L capacity`,
                  capacity_l: capacity,
                  material: variant.material || 'HDPE',
                  features: variant.features || [],
                  type: variant.type
                });
              }
            });
          } else if (variant.material) {
            // Handle simple variants (like Artificial Toilets)
            products.push({
              id: `PC-${categoryIndex}-${variantIndex}`,
              name: `${categoryName} - ${variant.material}`,
              category: 'Industrial Plastic Crates',
              subcategory: categoryName,
              description: `${categoryName} made with ${variant.material}`,
              material: variant.material
            });
          }
        });
        
        // Handle special sub-objects (like plastic_stand_dustbin, steel_dustbin)
        if (categoryData.plastic_stand_dustbin) {
          const standDustbin = categoryData.plastic_stand_dustbin;
          standDustbin.capacities_l.forEach((capacity: number, capIndex: number) => {
            standDustbin.types.forEach((type: string, typeIndex: number) => {
              products.push({
                id: `PC-${categoryIndex}-stand-${capIndex}-${typeIndex}`,
                name: `Plastic Stand Dustbin - ${capacity}L - ${type}`,
                category: 'Industrial Plastic Crates',
                subcategory: categoryName,
                description: `Plastic stand dustbin with ${capacity}L capacity, ${type} type`,
                capacity_l: capacity,
                material: 'Plastic',
                type: type,
                features: standDustbin.packs || []
              });
            });
          });
        }
        
        if (categoryData.steel_dustbin) {
          products.push({
            id: `PC-${categoryIndex}-steel`,
            name: `Steel Dustbin`,
            category: 'Industrial Plastic Crates',
            subcategory: categoryName,
            description: `Steel dustbin with multiple sizes and options`,
            material: categoryData.steel_dustbin.material,
            features: categoryData.steel_dustbin.features || []
          });
        }
      } else if (categoryData.products && Array.isArray(categoryData.products)) {
        // Handle categories with direct products array
        categoryData.products.forEach((product: any, productIndex: number) => {
          if (typeof product === 'string') {
            // Handle string products (like Material Handling Equipment)
            products.push({
              id: `PC-${categoryIndex}-${productIndex}`,
              name: product,
              category: 'Industrial Plastic Crates',
              subcategory: categoryName,
              description: `${product} - ${categoryName}`,
              material: 'Industrial Plastic'
            });
          } else if (product.outer_dimension) {
            // Handle products with dimensions (like Front Partly Open Bins)
            products.push({
              id: `PC-${categoryIndex}-${productIndex}`,
              name: `${categoryName} - ${product.outer_dimension}`,
              category: 'Industrial Plastic Crates',
              subcategory: categoryName,
              description: `${categoryName} with outer dimensions ${product.outer_dimension}`,
              outer_dimension: product.outer_dimension,
              inner_dimension: product.inner_dimension,
              material: 'Industrial Plastic'
            });
          } else if (product.name && product.variants) {
            // Handle products with variants (like Hospital Gloves)
            product.variants.forEach((variant: string, variantIndex: number) => {
              products.push({
                id: `PC-${categoryIndex}-${productIndex}-${variantIndex}`,
                name: `${product.name} - ${variant}`,
                category: 'Industrial Plastic Crates',
                subcategory: categoryName,
                description: `${product.name} in ${variant} variant`,
                material: 'Safety Equipment',
                series: product.name
              });
            });
          } else if (product.name) {
            // Handle regular named products
            products.push({
              id: `PC-${categoryIndex}-${productIndex}`,
              name: product.name,
              category: 'Industrial Plastic Crates',
              subcategory: categoryName,
              description: `${product.name} - ${categoryName}`,
              material: 'Industrial Plastic'
            });
          }
        });
      } else if (categoryData.series && Array.isArray(categoryData.series)) {
        // Handle Outdoor Gym & Park Fitness Equipment
        categoryData.series.forEach((series: any, seriesIndex: number) => {
          if (series.equipments && Array.isArray(series.equipments)) {
            series.equipments.forEach((equipment: any, equipIndex: number) => {
              products.push({
                id: `PC-${categoryIndex}-${seriesIndex}-${equipIndex}`,
                name: `${equipment.name} (${series.name})`,
                category: 'Industrial Plastic Crates',
                subcategory: categoryName,
                description: `${equipment.name} from ${series.name} - ${categoryName}`,
                material: 'Fitness Equipment',
                series: series.name,
                code: equipment.code
              });
            });
          }
        });
      } else if (categoryData.features) {
        // Handle categories with only features (like Custom & Partition Crates)
        products.push({
          id: `PC-${categoryIndex}`,
          name: categoryName,
          category: 'Industrial Plastic Crates',
          subcategory: categoryName,
          description: `${categoryName} - Custom solutions available`,
          material: 'Industrial Plastic',
          features: categoryData.features
        });
      }
      
      if (products.length > 0) {
        subcategories.push({
          name: categoryName,
          products: products
        });
      }
    });
    
    console.log('Transformed Plastic Crates data:', subcategories.length, 'subcategories');
    subcategories.forEach(sub => {
      console.log(`  - ${sub.name}: ${sub.products.length} products`);
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
    // Load data from multiple sources with error handling
    const responses = await Promise.allSettled([
      fetchWithFallback([
        '/product-catalog/other.json',
        '/src/product-catalog/other.json',
        './src/product-catalog/other.json',
        '../product-catalog/other.json'
      ]),
      fetchWithFallback([
        '/product-catalog/videos.json',
        '/src/product-catalog/videos.json',
        './src/product-catalog/videos.json',
        '../product-catalog/videos.json'
      ]),
      fetchWithFallback([
        '/data/products1.json',
        './public/data/products1.json',
        '../data/products1.json',
        './data/products1.json'
      ]),
      fetchWithFallback([
        '/data/products2.json',
        './public/data/products2.json',
        '../data/products2.json',
        './data/products2.json'
      ])
    ]);
    
    console.log('Fetched Other Products data sources');
    
    // Parse successful responses
    let otherData: any[] = [];
    let videosData: any[] = [];
    let products1Data: any[] = [];
    let products2Data: any[] = [];
    
    if (responses[0].status === 'fulfilled') {
      otherData = await responses[0].value.json();
      console.log('Parsed other.json data:', otherData.length, 'items');
    } else {
      console.warn('Failed to load other.json:', responses[0].reason);
    }
    
    if (responses[1].status === 'fulfilled') {
      videosData = await responses[1].value.json();
      console.log('Parsed videos.json data:', videosData.length, 'items');
    } else {
      console.warn('Failed to load videos.json:', responses[1].reason);
    }
    
    if (responses[2].status === 'fulfilled') {
      products1Data = await responses[2].value.json();
      console.log('Parsed products1.json data:', products1Data.length, 'items');
    } else {
      console.warn('Failed to load products1.json:', responses[2].reason);
    }
    
    if (responses[3].status === 'fulfilled') {
      products2Data = await responses[3].value.json();
      console.log('Parsed products2.json data:', products2Data.length, 'items');
    } else {
      console.warn('Failed to load products2.json:', responses[3].reason);
    }
    
    // Group all products by type/category
    const subcategories: SubcategoryData[] = [];
    
    // Process Other data (handle different structures)
    if (otherData && typeof otherData === 'object') {
      // Handle single object structure (like other.json)
      if (otherData.category && otherData.products) {
        const categoryName = otherData.category;
        const categoryProducts: Product[] = [];
        
        otherData.products.forEach((product: any, index: number) => {
          // Handle products with sizes_cm
          if (product.sizes_cm && Array.isArray(product.sizes_cm)) {
            product.sizes_cm.forEach((size: number, sizeIndex: number) => {
              categoryProducts.push({
                id: `OTH-${categoryName.substring(0, 2).toUpperCase()}-${index}-${sizeIndex}`,
                name: `${product.type} - ${size}cm`,
                category: 'Other Products',
                subcategory: categoryName,
                description: product.description || `${product.type} with ${size}cm size`,
                material: otherData.finish || 'Stainless Steel',
                sizes: [`${size}cm`],
                options: product.options || []
              });
            });
          }
          // Handle products with capacities_l
          else if (product.capacities_l && Array.isArray(product.capacities_l)) {
            product.capacities_l.forEach((capacity: any, capIndex: number) => {
              categoryProducts.push({
                id: `OTH-${categoryName.substring(0, 2).toUpperCase()}-${index}-${capIndex}`,
                name: `${product.type} - ${capacity.size_l}L`,
                category: 'Other Products',
                subcategory: categoryName,
                description: capacity.description || `${product.type} with ${capacity.size_l}L capacity`,
                material: otherData.finish || 'Stainless Steel',
                capacity_l: capacity.size_l,
                features: capacity.status ? [`Status: ${capacity.status}`] : []
              });
            });
          }
          // Handle products with sizes array
          else if (product.sizes && Array.isArray(product.sizes)) {
            product.sizes.forEach((size: any, sizeIndex: number) => {
              categoryProducts.push({
                id: `OTH-${categoryName.substring(0, 2).toUpperCase()}-${index}-${sizeIndex}`,
                name: `${product.type} - ${size.size || 'Size'}`,
                category: 'Other Products',
                subcategory: categoryName,
                description: size.description || `${product.type}`,
                material: otherData.finish || 'Stainless Steel'
              });
            });
          }
          // Handle regular products
          else {
            categoryProducts.push({
              id: `OTH-${categoryName.substring(0, 2).toUpperCase()}-${index}`,
              name: product.type || product.name || 'Product',
              category: 'Other Products',
              subcategory: categoryName,
              description: product.description || `${product.type || product.name}`,
              material: otherData.finish || 'Stainless Steel',
              options: product.options || []
            });
          }
        });
        
        if (categoryProducts.length > 0) {
          subcategories.push({
            name: categoryName,
            products: categoryProducts
          });
        }
      }
    }
    
    // Process Videos data (array of categories with products)
    if (videosData && Array.isArray(videosData) && videosData.length > 0) {
      videosData.forEach((categoryData: any) => {
        if (categoryData.category && categoryData.products && Array.isArray(categoryData.products)) {
          const categoryProducts: Product[] = categoryData.products.map((product: any, index: number) => {
            return {
              id: `VID-${categoryData.category.substring(0, 2).toUpperCase()}-${index}`,
              name: product.name || 'Product',
              category: 'Other Products',
              subcategory: categoryData.category,
              description: product.description || `${product.name} - ${categoryData.category}`,
              packaging: product.packaging,
              colors: product.colors || [],
              moq: product.moq,
              price_per_kg: product.price_per_kg,
              features: product.features || []
            };
          });
          
          subcategories.push({
            name: categoryData.category,
            products: categoryProducts
          });
        }
      });
    }
    
    // Process Products1 data (various categories)
    if (products1Data && Array.isArray(products1Data) && products1Data.length > 0) {
      const products1Map = new Map<string, any[]>();
      
      products1Data.forEach((product: any) => {
        const type = product.type || product.category || 'General Products';
        if (!products1Map.has(type)) {
          products1Map.set(type, []);
        }
        products1Map.get(type)?.push(product);
      });
      
      products1Map.forEach((products, type) => {
        const typeProducts: Product[] = products.map((product, index) => {
          return {
            id: product.id || `P1-${type.substring(0, 2).toUpperCase()}-${index}`,
            name: product.name || 'Product',
            category: 'Other Products',
            subcategory: type,
            description: product.description || `${product.name || 'Product'} - ${type}`,
            features: product.tags || [],
            brand: 'Shivaya Solutions'
          };
        });
        
        subcategories.push({
          name: type,
          products: typeProducts
        });
      });
    }

    // Process Products2 data (various categories)
    if (products2Data && Array.isArray(products2Data) && products2Data.length > 0) {
      const products2Map = new Map<string, any[]>();

      products2Data.forEach((product: any) => {
        const type = product.type || product.category || 'General Products';
        if (!products2Map.has(type)) {
          products2Map.set(type, []);
        }
        products2Map.get(type)?.push(product);
      });

      products2Map.forEach((products, type) => {
        const typeProducts: Product[] = products.map((product, index) => {
          return {
            id: product.id || `P2-${type.substring(0, 2).toUpperCase()}-${index}`,
            name: product.name || 'Product',
            category: 'Other Products',
            subcategory: type,
            description: product.description || `${product.name || 'Product'} - ${type}`,
            features: product.tags || [],
            brand: 'Shivaya Solutions'
          };
        });
        
        subcategories.push({
          name: type,
          products: typeProducts
        });
      });
    }
    
    console.log('Transformed Other Products data:', subcategories.length, 'subcategories');
    subcategories.forEach(sub => {
      console.log(`  - ${sub.name}: ${sub.products.length} products`);
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
    console.log('Starting to load all product categories...');
    
    // Load all product categories with individual error handling
    const results = await Promise.allSettled([
      loadMetalPens(),
      loadKitchenWorld(),
      loadHouseholdProducts(),
      loadPlasticCrates(),
      loadOtherProducts()
    ]);
    
    // Extract successful results and log failures
    const catalog: CategoryData[] = [];
    const categoryNames = ['Metal Pens', 'Kitchen World', 'Household Products', 'Industrial Plastic Crates', 'Other Products'];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        catalog.push(result.value);
        console.log(`✓ ${categoryNames[index]} loaded: ${result.value.subcategories.length} subcategories`);
        
        // Debug: Log products count for each subcategory
        result.value.subcategories.forEach((sub, subIndex) => {
          console.log(`  - ${sub.name}: ${sub.products.length} products`);
        });
      } else {
        console.error(`✗ Failed to load ${categoryNames[index]}:`, result.reason);
        // Add empty category to maintain structure
        catalog.push({
          category: categoryNames[index],
          subcategories: []
        });
      }
    });
    
    console.log('Product categories loading completed');
    console.log('Total categories loaded:', catalog.filter(cat => cat.subcategories.length > 0).length, 'out of', catalog.length);
    
    console.log('Adding dynamic image URLs...');
    
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
    
    console.log('Product catalog loaded successfully!');
    console.log('Total categories:', catalog.length);
    let totalSubcategories = 0;
    let totalProducts = 0;
    
    catalog.forEach(category => {
      totalSubcategories += category.subcategories.length;
      category.subcategories.forEach(subcategory => {
        totalProducts += subcategory.products.length;
      });
    });
    
    console.log('Total subcategories:', totalSubcategories);
    console.log('Total products:', totalProducts);
    
    return catalog;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
} 