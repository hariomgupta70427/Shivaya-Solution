import React, { useState, useEffect } from 'react';
import Layout from '../../components/admin/Layout';
import { getCategories as getCategoriesFromCSV, getAllProducts, initializeCSVDatabase, getProductsByCategory } from '../../services/csvProductService';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

interface CategoryData {
  name: string;
  count: number;
  subcategories: { name: string; count: number }[];
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories with product counts
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize CSV database
      await initializeCSVDatabase();
      
      // Get all products and categories
      const [products, categoryNames] = await Promise.all([
        getAllProducts(),
        getCategoriesFromCSV()
      ]);
      
      // Calculate category statistics
      const categoryStats = categoryNames.map(categoryName => {
        const categoryProducts = products.filter(p => p.category === categoryName);
        
        // Get subcategories for this category
        const subcategoryMap = categoryProducts.reduce((acc, product) => {
          const subcategory = product.subcategory || 'Uncategorized';
          acc[subcategory] = (acc[subcategory] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const subcategories = Object.entries(subcategoryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        return {
          name: categoryName,
          count: categoryProducts.length,
          subcategories
        };
      }).sort((a, b) => b.count - a.count);
      
      setCategories(categoryStats);
      console.log(`Loaded ${categoryStats.length} categories with product counts`);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="h-64">
          <LoadingSpinner 
            size="lg" 
            message="Loading categories..." 
            className="h-full"
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-6 w-6 text-red-400 dark:text-red-500 mr-3" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-brand-warm-orange text-white rounded-md hover:bg-brand-mustard"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage product categories and view their statistics
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchCategories}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedCategory === category.name
                  ? 'border-brand-warm-orange shadow-xl'
                  : 'border-gray-200 dark:border-gray-700 hover:border-brand-warm-orange/50'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <div className="bg-brand-warm-orange text-white text-sm font-bold px-3 py-1 rounded-full">
                    {category.count}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                    <span className="font-medium text-gray-900 dark:text-white">{category.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subcategories</span>
                    <span className="font-medium text-gray-900 dark:text-white">{category.subcategories.length}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Category Distribution</span>
                    <span>{Math.round((category.count / categories.reduce((sum, cat) => sum + cat.count, 0)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-brand-warm-orange h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(category.count / categories.reduce((sum, cat) => sum + cat.count, 0)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Subcategories preview */}
                {category.subcategories.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Top Subcategories:</div>
                    <div className="space-y-1">
                      {category.subcategories.slice(0, 3).map((subcategory) => (
                        <div key={subcategory.name} className="flex justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300 truncate">
                            {subcategory.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            {subcategory.count}
                          </span>
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{category.subcategories.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed View for Selected Category */}
        {selectedCategory && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCategory} - Detailed View
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ExclamationCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(() => {
                const category = categories.find(cat => cat.name === selectedCategory);
                if (!category) return null;
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Stats */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Category Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{category.count}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Subcategories</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{category.subcategories.length}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Largest Subcategory</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {category.subcategories[0]?.name} ({category.subcategories[0]?.count})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* All Subcategories */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">All Subcategories</h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {category.subcategories.map((subcategory, index) => (
                          <div
                            key={subcategory.name}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-brand-warm-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {subcategory.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {subcategory.count}
                              </span>
                              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-brand-warm-orange h-2 rounded-full"
                                  style={{
                                    width: `${(subcategory.count / category.count) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-warm-orange mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-warm-orange mb-2">
                  {categories.reduce((sum, cat) => sum + cat.count, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-warm-orange mb-2">
                  {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Subcategories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </ErrorBoundary>
  );
};

export default Categories; 