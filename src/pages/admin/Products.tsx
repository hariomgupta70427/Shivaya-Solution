import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';
import Layout from '../../components/admin/Layout';
import { Product } from '../../types/product';
import { Link } from 'react-router-dom';
import ProductsTable from '../../components/admin/ProductsTable';
import CSVImportExportModal from '../../components/admin/CSVImportExportModal';
import ProductEditModal from '../../components/admin/ProductEditModal';
import CategoryOverview from '../../components/admin/CategoryOverview';
import {
  getAllProducts,
  deleteProduct as deleteCSVProduct,
  initializeCSVDatabase,
  refreshCSVDatabase,
  getProductStats,
  getCategories
} from '../../services/csvProductService';
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  lastUpdated: string;
  productsByCategory: Record<string, number>;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('edit');
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filter states with localStorage persistence
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useLocalStorage('admin-category-filter', '');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useLocalStorage('admin-stock-filter', '');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('admin-items-per-page', 20);
  
  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Categories for filtering
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  
  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter using debounced term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.subcategory?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Subcategory filter
    if (subcategoryFilter) {
      filtered = filtered.filter(product => product.subcategory === subcategoryFilter);
    }

    // Stock filter
    if (stockFilter) {
      if (stockFilter === 'in_stock') {
        filtered = filtered.filter(product => product.in_stock);
      } else if (stockFilter === 'out_of_stock') {
        filtered = filtered.filter(product => !product.in_stock);
      }
    }

    return filtered;
  }, [products, debouncedSearchTerm, categoryFilter, subcategoryFilter, stockFilter]);

  // Initialize CSV database and fetch products
  const initializeAndFetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize CSV database if needed
      await initializeCSVDatabase();
      
      // Fetch products and categories
      const [data, categoriesData] = await Promise.all([
        getAllProducts(),
        getCategories()
      ]);
      
      setProducts(data);
      setCategories(categoriesData);
      
      // Get stats
      const statsData = await getProductStats();
      setStats(statsData);
      
      console.log(`Loaded ${data.length} products from CSV database`);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAndFetchProducts();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, subcategoryFilter, stockFilter]);

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryFilter) {
      const categoryProducts = products.filter(p => p.category === categoryFilter);
      const uniqueSubcategories = Array.from(
        new Set(
          categoryProducts
            .map(p => p.subcategory)
            .filter((subcategory): subcategory is string => Boolean(subcategory))
        )
      );
      setSubcategories(uniqueSubcategories);
    } else {
      const allSubcategories = Array.from(
        new Set(
          products
            .map(p => p.subcategory)
            .filter((subcategory): subcategory is string => Boolean(subcategory))
        )
      );
      setSubcategories(allSubcategories);
    }
    setSubcategoryFilter(''); // Reset subcategory filter when category changes
  }, [categoryFilter, products]);

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      currentProducts
    };
  }, [filteredProducts, currentPage, itemsPerPage]);

  const { totalPages, currentProducts } = paginationData;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSubcategoryFilter('');
    setStockFilter('');
    setCurrentPage(1);
  };

  // Handle product deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteCSVProduct(id);
        // Refresh products list
        await initializeAndFetchProducts();
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Failed to delete product');
        console.error(err);
      }
    }
  };

  // Handle product edit
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditMode('edit');
    setIsEditModalOpen(true);
  };

  // Handle create new product
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setEditMode('create');
    setIsEditModalOpen(true);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await initializeAndFetchProducts();
    toast.success('Products refreshed');
  };

  // Handle refresh from JSON catalogs
  const handleRefreshFromCatalogs = async () => {
    try {
      setLoading(true);
      const success = await refreshCSVDatabase();
      if (success) {
        await initializeAndFetchProducts();
        toast.success('Database refreshed from JSON catalogs');
      } else {
        toast.error('Failed to refresh from catalogs');
      }
    } catch (error) {
      toast.error('Error refreshing database');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle import success
  const handleImportSuccess = () => {
    toast.success('Products imported successfully');
    initializeAndFetchProducts();
  };

  // Handle edit success
  const handleEditSuccess = () => {
    initializeAndFetchProducts();
  };

  // Handle export
  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  // Handle import
  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Category Overview */}
        <CategoryOverview onCategorySelect={(category) => {
          setCategoryFilter(category);
        }} />

        {/* Header with stats */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Management
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshFromCatalogs}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                title="Refresh from JSON catalogs"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync Catalogs
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-warm-orange hover:bg-brand-mustard"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-brand-warm-orange" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCategories}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(stats.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400 dark:text-red-500 mr-3" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, brand, or SKU..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                disabled={!categoryFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">All Subcategories</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Products</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {currentProducts.length} of {filteredProducts.length} products
              {filteredProducts.length !== products.length && ` (filtered from ${products.length} total)`}
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <ProductsTable
          products={currentProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-brand-warm-orange text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        mode="import"
      />

      {/* CSV Export Modal */}
      <CSVImportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onImportSuccess={() => {}} // Not used for export
        mode="export"
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        product={selectedProduct}
        mode={editMode}
      />
    </Layout>
  );
};

export default Products; 