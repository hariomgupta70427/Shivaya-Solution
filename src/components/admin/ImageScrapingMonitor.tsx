import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, Database, AlertCircle, CheckCircle, Image } from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
}

interface ImageScrapingStats {
  success: boolean;
  stats: CacheStats;
  totalKeys: number;
  keys: string[];
}

const IMAGE_API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-server.com/api' 
  : 'http://localhost:3001/api';

const ImageScrapingMonitor: React.FC = () => {
  const [stats, setStats] = useState<ImageScrapingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  // Check server health
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${IMAGE_API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setServerStatus('online');
        setError(null);
        return true;
      } else {
        setServerStatus('offline');
        setError('Server responded with error');
        return false;
      }
    } catch (err) {
      setServerStatus('offline');
      setError('Cannot connect to image scraping server');
      return false;
    }
  };

  // Fetch cache statistics
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isOnline = await checkServerHealth();
      if (!isOnline) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${IMAGE_API_BASE_URL}/images/cache-stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastRefresh(new Date());
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    setClearingCache(true);
    try {
      const response = await fetch(`${IMAGE_API_BASE_URL}/images/clear-cache`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Cache cleared successfully! Removed ${data.clearedKeys} entries.`);
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to clear cache: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Error clearing cache: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setClearingCache(false);
    }
  };

  // Test image scraping with a sample product
  const testScraping = async () => {
    setIsLoading(true);
    try {
      const testProduct = {
        name: 'Test Metal Pen',
        category: 'Metal Pens',
        subcategory: 'Executive Series',
        description: 'Test product for scraping verification'
      };

      const response = await fetch(`${IMAGE_API_BASE_URL}/images/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Scraping test successful! Image URL: ${data.image.substring(0, 80)}...`);
        } else {
          alert('Scraping test failed: No image returned');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Scraping test failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Scraping test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      fetchStats(); // Refresh stats after test
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const hitRate = stats?.stats ? 
    ((stats.stats.hits / (stats.stats.hits + stats.stats.misses)) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Image className="h-6 w-6 text-brand-warm-orange" />
          Image Scraping Monitor
        </h2>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            serverStatus === 'online' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : serverStatus === 'offline'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {serverStatus === 'online' ? (
              <CheckCircle className="h-4 w-4" />
            ) : serverStatus === 'offline' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
            {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking...'}
          </div>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2 bg-brand-warm-orange hover:bg-brand-deep-mustard text-white rounded-lg disabled:opacity-50 transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {serverStatus === 'offline' && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Server Offline</span>
          </div>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            The image scraping server is not running. Start it with: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">npm run server:dev</code>
          </p>
        </div>
      )}

      {serverStatus === 'online' && (
        <>
          {/* Cache Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Database className="h-5 w-5" />
                <span className="font-medium">Cache Entries</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {stats?.totalKeys || 0}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Hit Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {hitRate}%
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Cache Hits</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {stats?.stats.hits || 0}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Cache Misses</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                {stats?.stats.misses || 0}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={testScraping}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Test Scraping
            </button>

            <button
              onClick={clearCache}
              disabled={clearingCache}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Database className={`h-4 w-4 ${clearingCache ? 'animate-spin' : ''}`} />
              Clear Cache
            </button>
          </div>

          {/* Recent Cache Keys */}
          {stats?.keys && stats.keys.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Recent Cache Entries ({stats.keys.length} shown)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {stats.keys.map((key, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Last Refresh Time */}
          {lastRefresh && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageScrapingMonitor;