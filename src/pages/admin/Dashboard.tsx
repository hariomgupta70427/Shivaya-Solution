import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../../components/admin/Layout';
import { getAllProducts, initializeCSVDatabase, getProductStats } from '../../services/csvProductService';
import { Product } from '../../types/product';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ShoppingBagIcon, TagIcon, ExclamationCircleIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { convertProductCatalogToCSV } from '../../utils/csvConverter';
import { importProductsFromJson } from '../../services/productService';
import { importCsvFile } from '../../utils/importCsvData';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingCatalog, setIsImportingCatalog] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Dashboard: Loading data...');
      
      // Fetch data in parallel for better performance
      const [productsData, statsData] = await Promise.all([
        getAllProducts(),
        getProductStats()
      ]);
      
      setProducts(productsData);
      setStats(statsData);
      
      console.log(`✅ Dashboard: Loaded ${productsData.length} products successfully`);
    } catch (err) {
      console.error('❌ Dashboard: Error fetching data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Import existing product catalog
  const handleImportCatalog = async () => {
    try {
      setIsImporting(true);
      toast.loading('Importing product catalog...');
      await importProductsFromJson([]);
      toast.dismiss();
      toast.success('Product catalog imported successfully');
      // Refresh products
      fetchData();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to import product catalog');
      console.error('Error importing catalog:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // Import directly from JSON files in product-catalog directory
  const handleImportFromJsonFiles = async () => {
    try {
      setIsImportingCatalog(true);
      toast.loading('Converting JSON catalog to CSV format...');
      
      // Convert the JSON catalog to CSV
      const csvData = await convertProductCatalogToCSV();
      console.log('CSV data generated, length:', csvData.length);
      
      if (!csvData || csvData.length === 0) {
        throw new Error('No CSV data generated');
      }
      
      // Parse the CSV data back to JSON for importing
      const Papa = await import('papaparse');
      const result = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      }
      
      // Import the parsed data
      await importProductsFromJson(result.data);
      
      toast.dismiss();
      toast.success('Product catalog imported successfully from JSON files');
      
      // Refresh products
      fetchData();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to import product catalog from JSON files');
      console.error('Error converting JSON to CSV:', err);
    } finally {
      setIsImportingCatalog(false);
    }
  };

  // Handle CSV file selection
  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImportingCsv(true);
      toast.loading('Importing CSV file...');
      
      // Import the CSV file
      await importCsvFile(file);
      
      toast.dismiss();
      toast.success(`Successfully imported products from ${file.name}`);
      
      // Refresh products
      fetchData();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to import CSV file');
      console.error('Error importing CSV file:', err);
    } finally {
      setIsImportingCsv(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleImportCsvClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Memoized calculations for better performance
  const dashboardStats = useMemo(() => [
    {
      name: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: stats?.totalCategories || Array.from(new Set(products.map(p => p.category))).length,
      icon: TagIcon,
      href: '/admin/categories',
      color: 'bg-green-500',
    },
  ], [products.length, stats?.totalCategories, products]);

  // Recent products (memoized)
  const recentProducts = useMemo(() => products.slice(0, 5), [products]);

  if (loading) {
    return (
      <Layout>
        <div className="h-64">
          <LoadingSpinner 
            size="lg" 
            message="Loading dashboard data..." 
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
            onClick={fetchData}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardStats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-warm-orange hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
            >
              Add New Product
            </Link>
            <Link
              to="/admin/categories/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
            >
              Add New Category
            </Link>
            <button
              onClick={handleImportCatalog}
              disabled={isImporting}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
            >
              <ArrowUpTrayIcon className={`h-5 w-5 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
              {isImporting ? 'Importing...' : 'Import Catalog Files'}
            </button>
            <button
              onClick={handleImportFromJsonFiles}
              disabled={isImportingCatalog}
              className="inline-flex items-center justify-center px-4 py-2 border border-indigo-500 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowUpTrayIcon className={`h-5 w-5 mr-2 ${isImportingCatalog ? 'animate-spin' : ''}`} />
              {isImportingCatalog ? 'Converting...' : 'Convert JSON to CSV'}
            </button>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleCsvFileChange}
                className="hidden"
              />
              <button
                onClick={handleImportCsvClick}
                disabled={isImportingCsv}
                className="inline-flex items-center justify-center px-4 py-2 border border-green-500 text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DocumentTextIcon className={`h-5 w-5 mr-2 ${isImportingCsv ? 'animate-spin' : ''}`} />
                {isImportingCsv ? 'Importing...' : 'Import CSV File'}
              </button>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  No products found. Use the "Import Catalog Files" or "Convert JSON to CSV" button to import your product catalog.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Products
              </h3>
              <Link
                to="/admin/products"
                className="text-sm text-brand-warm-orange hover:text-brand-mustard"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentProducts.length > 0 ? (
                    recentProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.image_url}
                                  alt={product.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {product.price ? `₹${product.price}` : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Dashboard; 