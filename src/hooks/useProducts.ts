import { useState, useEffect } from 'react';
import { loadProducts, CategoryData, SubcategoryData } from '../utils/productLoader';

export interface ProductVariant {
  size?: string;
  color?: string;
  model?: string;
  name?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand?: string;
  series?: string;
  material?: string;
  description: string;
  features?: string[];
  image?: string;
  variants?: string[] | ProductVariant[];
  sizes?: string[];
  colors?: string[];
  capacities?: string[];
  models?: { model_no: string; name: string }[];
  options?: { with_lid?: boolean; description: string }[];
  outer_dimension?: string;
  inner_dimension?: string;
  capacity_l?: number;
  capacity?: string;
  packaging?: string;
  moq?: number;
  price_per_kg?: number;
  finish?: string;
  type?: string;
  code?: string;
}

export interface SearchResult {
  type: 'product' | 'category' | 'subcategory';
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  product?: Product;
  description?: string;
  image?: string;
}

export function useProducts() {
  const [catalog, setCatalog] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        console.log('Fetching product catalog...');
        
        // Use the loadProducts function from productLoader
        const productCatalog = await loadProducts();
        
        if (!productCatalog || productCatalog.length === 0) {
          console.error('Product catalog is empty');
          setError('Product catalog is empty. Please check the data files.');
          return;
        }
        
        console.log('Product catalog fetched successfully:', productCatalog.length, 'categories');
        
        // Debug: Log each category and its subcategories
        productCatalog.forEach((category, index) => {
          console.log(`Category ${index + 1}: ${category.category} (${category.subcategories.length} subcategories)`);
          category.subcategories.forEach((subcategory, subIndex) => {
            console.log(`  Subcategory ${subIndex + 1}: ${subcategory.name} (${subcategory.products.length} products)`);
          });
        });
        
        setCatalog(productCatalog);
        setError(null);
      } catch (err) {
        console.error('Error loading product catalog:', err);
        setError(`Failed to load product catalog: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCatalog();
  }, []);
  
  // Get all categories
  const getCategories = () => catalog.map(cat => cat.category);
  
  // Get all subcategories for a specific category
  const getSubcategories = (category: string) => {
    const categoryData = catalog.find(cat => cat.category === category);
    return categoryData ? categoryData.subcategories.map(sub => sub.name) : [];
  };
  
  // Get all products for a specific subcategory
  const getProductsBySubcategory = (category: string, subcategory: string) => {
    const categoryData = catalog.find(cat => cat.category === category);
    if (!categoryData) return [];
    
    const subcategoryData = categoryData.subcategories.find(sub => sub.name === subcategory);
    return subcategoryData ? subcategoryData.products : [];
  };
  
  // Search products across all categories and subcategories
  const searchProducts = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    
    if (!query || query.trim() === '') {
      return results;
    }
    
    const searchTerm = query.toLowerCase();
    console.log('Searching for:', searchTerm, 'in', catalog.length, 'categories');
    
    // Search in categories
    catalog.forEach(categoryData => {
      // Add category if it matches search term
      if (categoryData.category.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'category',
          id: `cat-${categoryData.category}`,
          name: categoryData.category,
          description: `${categoryData.subcategories.length} subcategories available`,
          image: categoryData.banner || `https://source.unsplash.com/featured/?${categoryData.category.toLowerCase().replace(/\s+/g, ',')}`
        });
      }
      
      // Search in subcategories
      categoryData.subcategories.forEach(subcategoryData => {
        // Add subcategory if it matches search term
        if (subcategoryData.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subcategory',
            id: `subcat-${categoryData.category}-${subcategoryData.name}`,
            name: subcategoryData.name,
            category: categoryData.category,
            description: `${subcategoryData.products.length} products available`,
            image: subcategoryData.image || `https://source.unsplash.com/featured/?${subcategoryData.name.toLowerCase().replace(/\s+/g, ',')},${categoryData.category.toLowerCase().replace(/\s+/g, ',')}`
          });
        }
        
        // Search in products
        const matchingProducts = subcategoryData.products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          product.description.toLowerCase().includes(searchTerm) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm)) ||
          (product.features && product.features.some(feature => feature.toLowerCase().includes(searchTerm))) ||
          (product.series && product.series.toLowerCase().includes(searchTerm)) ||
          (product.material && product.material.toLowerCase().includes(searchTerm))
        );
        
        // Add matching products to results
        matchingProducts.forEach(product => {
          results.push({
            type: 'product',
            id: product.id,
            name: product.name,
            category: categoryData.category,
            subcategory: subcategoryData.name,
            product: product,
            description: product.description,
            image: product.image
          });
        });
      });
    });
    
    console.log('Search results found:', results.length);
    
    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExactMatch = a.name.toLowerCase() === searchTerm;
      const bExactMatch = b.name.toLowerCase() === searchTerm;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Sort by type (products first, then subcategories, then categories)
      const typeOrder = { product: 0, subcategory: 1, category: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    return results;
  };
  
  return {
    catalog,
    loading,
    error,
    getCategories,
    getSubcategories,
    getProductsBySubcategory,
    searchProducts
  };
}
