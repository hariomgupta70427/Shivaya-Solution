import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package, Tag } from 'lucide-react';
import { SearchResult } from '../../hooks/useProducts';
import ProductImage from './ProductImage';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
  debouncedSearch: string;
  onSelectResult: (result: SearchResult) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchResults,
  debouncedSearch,
  onSelectResult,
  isOpen,
  setIsOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to handle outside click to close the search panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Package className="h-4 w-4 text-brand-warm-orange" />;
      case 'subcategory':
        return <Tag className="h-4 w-4 text-brand-warm-orange" />;
      case 'product':
        return <Package className="h-4 w-4 text-brand-warm-orange" />;
      default:
        return <Package className="h-4 w-4 text-brand-warm-orange" />;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <div
          className={`${
            isOpen ? 'w-full md:w-72' : 'w-10'
          } transition-all duration-300 relative flex items-center`}
        >
          {isOpen ? (
            <>
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full py-2 pl-10 pr-10 rounded-full bg-white dark:bg-brand-dark-card border border-light-border dark:border-dark-border focus:border-brand-warm-orange focus:ring-2 focus:ring-brand-warm-orange/20 transition-all outline-none text-light-primary dark:text-dark-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-warm-orange" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-full bg-white dark:bg-brand-dark-card hover:bg-brand-warm-orange hover:text-white transition-all duration-300 shadow-md"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isOpen && searchQuery && (
        <div className="absolute z-50 mt-2 w-full md:w-96 bg-white dark:bg-brand-dark-card rounded-lg shadow-xl border border-light-border dark:border-dark-border max-h-[70vh] overflow-y-auto">
          {searchResults.length === 0 && debouncedSearch !== '' ? (
            <div className="py-6 px-4 text-center">
              <p className="text-light-secondary dark:text-dark-secondary">
                No results found for "{debouncedSearch}"
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="p-3 border-b border-light-border dark:border-dark-border">
                <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-light-border dark:divide-dark-border">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelectResult(result);
                      setSearchQuery('');
                      setIsOpen(false);
                    }}
                    className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3 w-12 h-12 rounded-md overflow-hidden">
                      {result.type === 'product' && result.product ? (
                        <ProductImage
                          product={result.product}
                          className="w-full h-full object-cover"
                          alt={result.name}
                          showLoader={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-warm-orange/20 flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-light-primary dark:text-dark-primary truncate">
                          {result.name}
                        </h4>
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-brand-warm-orange/10 text-brand-warm-orange capitalize flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary truncate mt-1">
                        {result.type === 'product'
                          ? `${result.subcategory}, ${result.category}`
                          : result.description || (result.type === 'subcategory' ? `In ${result.category}` : '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 