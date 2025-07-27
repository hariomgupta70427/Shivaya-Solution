import React, { useState, useEffect } from 'react';
import Layout from '../../components/admin/Layout';
import { getAllProducts, getProductStats, getCategories } from '../../services/csvProductService';
import { Product } from '../../types/product';
import { ChartBarIcon, ArrowTrendingUpIcon, ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const Analytics: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel for better performance
        const [productsData, categoriesData, statsData] = await Promise.all([
          getAllProducts(),
          getCategories(),
          getProductStats()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setStats(statsData);
        
        console.log(`Analytics: Loaded ${productsData.length} products and ${categoriesData.length} categories`);
      } catch (err) {
        console.error('Analytics: Error fetching data:', err);
        setError('Failed to load analytics data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const productsInStock = products.filter((product) => product.in_stock).length;
  const productsOutOfStock = products.filter((product) => !product.in_stock).length;

  // Calculate products by category
  const productsByCategory = categories.map((category) => {
    const count = products.filter((product) => product.category === category).length;
    return {
      name: category,
      count,
      percentage: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  if (loading) {
    return (
      <Layout>
        <div className="h-64">
          <LoadingSpinner 
            size="lg" 
            message="Loading analytics data..." 
            className="h-full"
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Loading Analytics
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Overview of your product catalog performance and statistics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Products */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {totalProducts.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Categories */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <TagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Categories
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {totalCategories}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Products In Stock */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        In Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {productsInStock.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Out of Stock */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Out of Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {productsOutOfStock.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Categories by Product Count
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {productsByCategory.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.count} products ({category.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-brand-warm-orange h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Analytics;