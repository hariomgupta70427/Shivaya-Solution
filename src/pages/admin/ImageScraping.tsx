import React from 'react';
import Layout from '../../components/admin/Layout';
import ImageScrapingMonitor from '../../components/admin/ImageScrapingMonitor';

const ImageScrapingPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Image Scraping System
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage real-time image scraping from search engines
          </p>
        </div>

        <ImageScrapingMonitor />

        {/* Information Panel */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How It Works
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• <strong>Real-Time Scraping:</strong> Images are fetched from Google, Bing, and DuckDuckGo based on product attributes</p>
            <p>• <strong>Smart Caching:</strong> Images are cached for 1 hour to improve performance and reduce requests</p>
            <p>• <strong>Fallback System:</strong> If scraping fails, predefined category-specific images are used</p>
            <p>• <strong>Rate Limiting:</strong> Built-in limits prevent overwhelming search engines</p>
            <p>• <strong>Image Validation:</strong> All scraped images are validated before serving</p>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            Usage Guidelines
          </h2>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <p>• <strong>Respect Rate Limits:</strong> The system automatically limits requests to prevent blocking</p>
            <p>• <strong>Cache Management:</strong> Clear cache only when necessary to get fresh images</p>
            <p>• <strong>Server Status:</strong> Ensure the backend server is running for real-time scraping</p>
            <p>• <strong>Fallback Images:</strong> The system will always show appropriate images even if scraping fails</p>
            <p>• <strong>Performance:</strong> First load may take 5-15 seconds, subsequent loads are instant (cached)</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageScrapingPage;