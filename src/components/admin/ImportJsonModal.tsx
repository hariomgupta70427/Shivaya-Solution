import React, { useState } from 'react';
import { importProductsFromJson } from '../../services/productService';
import { importCsvFile, importCsvString } from '../../utils/importCsvData';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductsContainer {
  products: any[];
  [key: string]: any;
}

const ImportJsonModal: React.FC<ImportJsonModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [jsonText, setJsonText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'json' | 'csv'>('json');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Determine file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const isCSV = fileExtension === 'csv';
      setFileType(isCSV ? 'csv' : 'json');
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setJsonText(content);
        } catch (err) {
          setError('Failed to read file');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setError(null);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!jsonText.trim()) {
        setError('Please provide data');
        return;
      }
      
      if (fileType === 'csv') {
        // Import CSV data directly
        try {
          const count = await importCsvString(jsonText);
          onSuccess();
          onClose();
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to import CSV data');
          return;
        }
      }
      
      // Handle JSON data
      let jsonData: any[];
      
      try {
        // Parse JSON
        jsonData = JSON.parse(jsonText);
      } catch (err) {
        setError('Invalid JSON format. Please check your data.');
        return;
      }
      
      // Validate data structure
      if (!Array.isArray(jsonData)) {
        // If it's an object with a products array, use that
        const dataObject = jsonData as unknown as ProductsContainer;
        if (dataObject && typeof dataObject === 'object' && Array.isArray(dataObject.products)) {
          jsonData = dataObject.products;
        } else {
          setError('Data must be an array of products or an object with a products array');
          return;
        }
      }
      
      // Import products
      await importProductsFromJson(jsonData);
      
      // Close modal and refresh data
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectFileImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (fileType === 'csv') {
        // Import CSV file directly
        const count = await importCsvFile(file);
        onSuccess();
        onClose();
      } else {
        // For JSON files, read and parse the file
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const jsonData = JSON.parse(content);
            
            if (!Array.isArray(jsonData)) {
              // If it's an object with a products array, use that
              const dataObject = jsonData as unknown as ProductsContainer;
              if (dataObject && typeof dataObject === 'object' && Array.isArray(dataObject.products)) {
                await importProductsFromJson(dataObject.products);
              } else {
                setError('Data must be an array of products or an object with a products array');
                setLoading(false);
                return;
              }
            } else {
              await importProductsFromJson(jsonData);
            }
            
            onSuccess();
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import JSON file');
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          setError('Error reading file');
          setLoading(false);
        };
        
        reader.readAsText(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Import Products from {fileType === 'csv' ? 'CSV' : 'JSON'}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload a {fileType === 'csv' ? 'CSV' : 'JSON'} file or paste data containing your product information.
                  </p>
                  
                  {/* File input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File
                    </label>
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Accepts both JSON and CSV files
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleDirectFileImport}
                        disabled={loading || !file}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm ${
                          loading || !file
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                      >
                        {loading ? 'Importing...' : `Import ${file?.name || 'File'} Directly`}
                      </button>
                    </div>
                  </div>
                  
                  {/* File type selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data Format
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-brand-warm-orange"
                          checked={fileType === 'json'}
                          onChange={() => setFileType('json')}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">JSON</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-brand-warm-orange"
                          checked={fileType === 'csv'}
                          onChange={() => setFileType('csv')}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">CSV</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Text area for data */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Or Paste {fileType === 'csv' ? 'CSV' : 'JSON'} Data
                    </label>
                    <textarea
                      value={jsonText}
                      onChange={handleTextChange}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
                      placeholder={fileType === 'csv' 
                        ? 'name,category,description,price,image_url\nProduct 1,Category 1,Description 1,100,https://example.com/image1.jpg'
                        : '[{"name": "Product 1", "category": "Category 1", "description": "Description 1"}, ...]'}
                    ></textarea>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-warm-orange text-base font-medium text-white hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange sm:ml-3 sm:w-auto sm:text-sm"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportJsonModal; 