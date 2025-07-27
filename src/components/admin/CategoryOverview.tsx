import React, { useState, useEffect } from 'react';
import { ChartBarIcon, TagIcon, CubeIcon } from '@heroicons/react/24/outline';
import { getAllProducts } from '../../services/csvProductService';
import { Product } from '../../types/product';

interface CategoryStats {
  name: string;
  count: number;
  subcategories: { [key: string]: number };
}

interface CategoryOverviewProps {
  onCategorySelect?: (category: string) => void;
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ onCategorySelect }) => {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);
        const products = await getAllProducts();
        
        // Calculate category statistics
        const categoryMap: { [key: string]: CategoryStats } = {};
        
        products.forEach((product: Product) => {
          const category = product.category || 'Uncategorized';
          const subcategory = product.subcategory || 'General';
          
          if (!categoryMap[category]) {
            categoryMap[category] = {
              name: category,
              count: 0,
              subcategories: {}
            };
          }
          
          categoryMap[category].count++;
          categoryMap[category].subcategories[subcategory] = 
            (categoryMap[category].subcategories[subcategory] || 0) + 1;
        });
        
        const stats = Object.values(categoryMap).sort((a, b) => b.count - a.count);
        setCategoryStats(stats);
        setTotalProducts(products.length);
      } catch (error) {
        console.error('Error loading category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Metal Pen': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Kitchenware': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Household': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Plasticware': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors['Other'];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Metal Pen':
        return '✒️';
      case 'Kitchenware':
        return '🍳';
      case 'Household':
        return '🏠';
      case 'Plasticware':
        return '🥤';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      onCategorySelect?.('');
    } else {
      setSelectedCategory(categoryName);
      onCategorySelect?.(categoryName);
    }
  };

  const toggleExpanded = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Overview
          </h3>
          <div className="flex items-center space-x-4">
            {selectedCategory && (
              <button
                onClick={() => handleCategoryClick(selectedCategory)}
                className="text-sm text-brand-warm-orange hover:text-brand-mustard font-medium"
              >
                Clear Selection
              </button>
            )}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CubeIcon className="h-4 w-4 mr-1" />
              {totalProducts.toLocaleString()} Total Products
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryStats.map((category) => (
            <div
              key={category.name}
              className={`relative cursor-pointer transition-all duration-200 rounded-lg border-2 ${
                selectedCategory === category.name
                  ? 'border-brand-warm-orange shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-brand-warm-orange/50 hover:shadow-md'
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Category
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-brand-warm-orange">
                    {category.count}
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {category.name}
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Products</span>
                    <span>{Math.round((category.count / totalProducts) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-brand-warm-orange h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(category.count / totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Object.keys(category.subcategories).length} subcategories
                  </div>
                </div>

                {/* Expand button for subcategories */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(category.name);
                  }}
                  className="mt-2 w-full text-xs text-brand-warm-orange hover:text-brand-mustard font-medium"
                >
                  {expandedCategory === category.name ? 'Hide Details' : 'Show Details'}
                </button>

                {/* Expanded subcategories */}
                {expandedCategory === category.name && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Top Subcategories:
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(category.subcategories)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([subcategory, count]) => (
                          <div key={subcategory} className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400 truncate">
                              {subcategory}
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium ml-2">
                              {count}
                            </span>
                          </div>
                        ))}
                      {Object.keys(category.subcategories).length > 5 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          +{Object.keys(category.subcategories).length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {selectedCategory === category.name && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-brand-warm-orange rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-warm-orange">
                {categoryStats.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-warm-orange">
                {categoryStats.reduce((sum, cat) => sum + Object.keys(cat.subcategories).length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subcategories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-warm-orange">
                {Math.round(totalProducts / categoryStats.length)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Category</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryOverview;