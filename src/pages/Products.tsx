import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { useProducts, Product } from '../hooks/useProducts';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProductImage from '../components/Products/ProductImage';
import SearchBar from '../components/Products/SearchBar';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Helper function to create URL-friendly slugs
const createSlug = (text: string): string => {
  if (!text) return 'unknown';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to find category, subcategory or product by slug
const findBySlug = (items: any[], slug: string): any | undefined => {
  return items.find(item => createSlug(item.name || item.category) === slug);
};

const Products: React.FC = () => {
  const { catalog, loading, error, searchProducts } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug, subcategorySlug, productSlug } = useParams<{
    categorySlug?: string;
    subcategorySlug?: string;
    productSlug?: string;
  }>();

  const [layer, setLayer] = useState<'category' | 'subcategory' | 'product'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Set up navigation based on URL params
  useEffect(() => {
    if (loading || error || !catalog.length) return;

    if (categorySlug) {
      const category = catalog.find(cat => createSlug(cat.category) === categorySlug);
      if (category) {
        setSelectedCategory(category.category);
        setLayer('subcategory');

        if (subcategorySlug) {
          const subcategory = category.subcategories.find(sub => createSlug(sub.name) === subcategorySlug);
          if (subcategory) {
            setSelectedSubcategory(subcategory.name);
            setLayer('product');

            if (productSlug) {
              const product = subcategory.products.find(prod => createSlug(prod.name) === productSlug);
              if (product) {
                setSelectedProduct(product);
              }
            }
          }
        }
      }
    }
  }, [catalog, categorySlug, subcategorySlug, productSlug, loading, error]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    
    return searchProducts(debouncedSearch).slice(0, 15);
  }, [debouncedSearch, searchProducts]);

  // Navigation functions
  const goToCategory = (category: string) => {
    setSelectedCategory(category);
    setLayer('subcategory');
    setSelectedSubcategory(null);
    setSelectedProduct(null);
    navigate(`/products/${createSlug(category)}`);
  };

  const goToSubcategory = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setLayer('product');
    setSelectedProduct(null);
    navigate(`/products/${createSlug(selectedCategory as string)}/${createSlug(subcategory)}`);
  };

  const goToProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/products/${createSlug(product.category)}/${createSlug(product.subcategory)}/${createSlug(product.name)}`);
  };
  
  const goBack = () => {
    if (layer === 'subcategory') {
      setLayer('category');
      setSelectedCategory(null);
      navigate('/products');
    } else if (layer === 'product') {
      if (!selectedProduct) {
        setLayer('subcategory');
        setSelectedSubcategory(null);
        navigate(`/products/${createSlug(selectedCategory as string)}`);
      } else {
        // If viewing a specific product, go back to its subcategory
        setSelectedProduct(null);
        navigate(`/products/${createSlug(selectedCategory as string)}/${createSlug(selectedSubcategory as string)}`);
      }
    }
  };

  const handleSearchResult = (result: any) => {
    if (result.type === 'category') {
      setSelectedCategory(result.name);
      setLayer('subcategory');
      setSelectedSubcategory(null);
      setSelectedProduct(null);
      navigate(`/products/${createSlug(result.name)}`);
    } else if (result.type === 'subcategory') {
      setSelectedCategory(result.category);
      setSelectedSubcategory(result.name);
      setLayer('product');
      setSelectedProduct(null);
      navigate(`/products/${createSlug(result.category)}/${createSlug(result.name)}`);
    } else if (result.type === 'product') {
      setSelectedCategory(result.category);
      setSelectedSubcategory(result.subcategory);
      setSelectedProduct(result.product);
      setLayer('product');
      navigate(`/products/${createSlug(result.category)}/${createSlug(result.subcategory)}/${createSlug(result.name)}`);
    }
    setSearchOpen(false);
    setSearch('');
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Categories', onClick: () => { setLayer('category'); setSelectedCategory(null); setSelectedSubcategory(null); setSelectedProduct(null); navigate('/products'); } },
  ];
  if (selectedCategory) breadcrumbs.push({ label: selectedCategory, onClick: () => { setLayer('subcategory'); setSelectedSubcategory(null); setSelectedProduct(null); navigate(`/products/${createSlug(selectedCategory)}`); } });
  if (selectedSubcategory) breadcrumbs.push({ label: selectedSubcategory, onClick: () => { setLayer('product'); setSelectedProduct(null); navigate(`/products/${createSlug(selectedCategory as string)}/${createSlug(selectedSubcategory)}`); } });
  if (selectedProduct) breadcrumbs.push({ label: selectedProduct.name, onClick: () => {} });

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-brand-cream dark:bg-brand-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-light-secondary dark:text-dark-secondary text-lg">Loading product catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-brand-cream dark:bg-brand-dark-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-light-secondary dark:text-dark-secondary text-lg">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-brand-warm-orange text-white rounded-md hover:bg-brand-warm-orange/80"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="pt-16 min-h-screen bg-brand-cream dark:bg-brand-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
              Product Catalog
            </h1>
            <p className="text-light-secondary dark:text-dark-secondary">
              Explore our comprehensive range of quality products
            </p>
          </div>
          
          {/* Search Bar Component */}
          <SearchBar
            onSearch={setSearch}
            searchResults={searchResults}
            debouncedSearch={debouncedSearch}
            onSelectResult={handleSearchResult}
            isOpen={searchOpen}
            setIsOpen={setSearchOpen}
          />
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 mb-8">
          {layer !== 'category' && (
            <button
              onClick={goBack}
              className="p-2 rounded-full bg-white dark:bg-brand-dark-card shadow-md hover:bg-brand-warm-orange hover:text-white transition-all duration-300 mr-2"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              <button
                onClick={crumb.onClick}
                className="text-brand-warm-orange hover:underline transition-colors font-medium"
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
            </span>
          ))}
        </div>

        {/* Category View */}
        {layer === 'category' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catalog.map((category, index) => (
              <div 
                key={index} 
                onClick={() => goToCategory(category.category)}
                className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <ProductImage
                    product={{
                      id: `category-${index}`,
                      name: category.category,
                      category: category.category,
                      subcategory: '',
                      description: `${category.category} collection`,
                    }}
                    className="w-full h-full object-cover"
                    alt={category.category}
                  />
                  <h2 className="absolute bottom-3 left-3 text-white text-xl font-bold z-20">{category.category}</h2>
                </div>
                <div className="p-4">
                  <p className="text-light-secondary dark:text-dark-secondary">
                    {category.subcategories.length} subcategories
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subcategory View */}
        {layer === 'subcategory' && selectedCategory && (
          <div>
            <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-6">
              {selectedCategory} Subcategories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalog
                .find(cat => cat.category === selectedCategory)?.subcategories
                .map((subcategory, index) => (
                  <div 
                    key={index} 
                    onClick={() => goToSubcategory(subcategory.name)}
                    className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                      <ProductImage
                        product={{
                          id: `subcategory-${index}`,
                          name: subcategory.name,
                          category: selectedCategory,
                          subcategory: subcategory.name,
                          description: `${subcategory.name} collection`,
                        }}
                        className="w-full h-full object-cover"
                        alt={subcategory.name}
                      />
                      <h3 className="absolute bottom-3 left-3 text-white text-xl font-bold z-20">{subcategory.name}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-light-secondary dark:text-dark-secondary">
                        {subcategory.products.length} products
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Products View */}
        {layer === 'product' && selectedCategory && selectedSubcategory && (
          <div>
            <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-2">
              {selectedSubcategory} Products
            </h2>
            <p className="text-light-secondary dark:text-dark-secondary mb-6">{selectedCategory} Collection</p>
            
            {!selectedProduct ? (
              // Products Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalog
                  .find(cat => cat.category === selectedCategory)
                  ?.subcategories.find(sub => sub.name === selectedSubcategory)
                  ?.products.map((product, index) => (
                    <div 
                      key={index}
                      onClick={() => goToProduct(product)}
                      className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="h-48 overflow-hidden">
                        <ProductImage
                          product={product}
                          className="w-full h-full object-cover"
                          alt={product.name}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-light-primary dark:text-dark-primary mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-light-secondary dark:text-dark-secondary text-sm line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              // Product Detail View
              <div className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-80 md:h-96">
                      <ProductImage
                        product={selectedProduct}
                        className="w-full h-full object-contain"
                        alt={selectedProduct.name}
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-3">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-brand-warm-orange mb-4">
                      {selectedProduct.subcategory} / {selectedProduct.category}
                    </p>
                    <p className="text-light-secondary dark:text-dark-secondary mb-6">
                      {selectedProduct.description}
                    </p>
                    
                    {/* Product Details */}
                    <div className="space-y-4">
                      {selectedProduct.features && selectedProduct.features.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Features</h4>
                          <ul className="list-disc ml-5 space-y-1 text-light-secondary dark:text-dark-secondary">
                            {selectedProduct.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Available Sizes</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.sizes.map((size, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Available Colors</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.colors.map((color, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedProduct.models && selectedProduct.models.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Models</h4>
                          <div className="space-y-2">
                            {selectedProduct.models.map((model, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-brand-warm-orange" />
                                <span className="text-light-primary dark:text-dark-primary">
                                  {model.model_no}: {model.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Additional product information */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {selectedProduct.material && (
                          <div>
                            <h4 className="text-sm text-light-secondary dark:text-dark-secondary">Material</h4>
                            <p className="text-light-primary dark:text-dark-primary">{selectedProduct.material}</p>
                          </div>
                        )}
                        {selectedProduct.capacity_l && (
                          <div>
                            <h4 className="text-sm text-light-secondary dark:text-dark-secondary">Capacity</h4>
                            <p className="text-light-primary dark:text-dark-primary">{selectedProduct.capacity_l} L</p>
                          </div>
                        )}
                        {selectedProduct.outer_dimension && (
                          <div>
                            <h4 className="text-sm text-light-secondary dark:text-dark-secondary">Outer Dimensions</h4>
                            <p className="text-light-primary dark:text-dark-primary">{selectedProduct.outer_dimension}</p>
                          </div>
                        )}
                        {selectedProduct.inner_dimension && (
                          <div>
                            <h4 className="text-sm text-light-secondary dark:text-dark-secondary">Inner Dimensions</h4>
                            <p className="text-light-primary dark:text-dark-primary">{selectedProduct.inner_dimension}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8 flex space-x-4">
                      <button
                        onClick={() => window.location.href = '/contact'}
                        className="px-6 py-3 bg-brand-warm-orange text-white rounded-lg hover:bg-brand-mustard transition-colors"
                      >
                        Inquire About This Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;