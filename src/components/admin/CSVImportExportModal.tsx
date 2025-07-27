import React, { useState, useRef } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { importProductsFromCSV, exportProductsAsCSV, downloadProductsCSV } from '../../services/csvProductService';
import toast from 'react-hot-toast';

interface CSVImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  mode: 'import' | 'export';
}

const CSVImportExportModal: React.FC<CSVImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please provide CSV data to import');
      return;
    }

    try {
      setLoading(true);
      const importedCount = await importProductsFromCSV(csvData, replaceExisting);
      toast.success(`Successfully imported ${importedCount} products`);
      onImportSuccess();
      onClose();
      setCsvData('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await downloadProductsCSV('shivaya-products-export.csv');
      toast.success('Products exported successfully');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export products');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewExport = async () => {
    try {
      setLoading(true);
      const csvData = await exportProductsAsCSV();
      setCsvData(csvData);
      toast.success('Export preview generated');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {mode === 'import' ? 'Import Products from CSV' : 'Export Products to CSV'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {mode === 'import' ? (
          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive
                  ? 'border-brand-warm-orange bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Drop CSV file here or click to browse
                  </span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  CSV files only, up to 10MB
                </p>
              </div>
            </div>

            {/* CSV Data Preview */}
            {csvData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSV Data Preview
                </label>
                <textarea
                  value={csvData.slice(0, 1000) + (csvData.length > 1000 ? '...' : '')}
                  readOnly
                  rows={8}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Showing first 1000 characters. Total length: {csvData.length} characters
                </p>
              </div>
            )}

            {/* Import Options */}
            <div className="flex items-center">
              <input
                id="replace-existing"
                name="replace-existing"
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="h-4 w-4 text-brand-warm-orange focus:ring-brand-warm-orange border-gray-300 rounded"
              />
              <label htmlFor="replace-existing" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Replace existing products (otherwise, append to existing)
              </label>
            </div>

            {/* Import Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                CSV Format Requirements:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• First row must contain column headers</li>
                <li>• Required columns: name, category, description</li>
                <li>• Optional columns: subcategory, price, image_url, in_stock, brand, sku</li>
                <li>• Use comma (,) as delimiter</li>
                <li>• Enclose text containing commas in quotes</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!csvData.trim() || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-warm-orange hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Products'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Export Options */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Export Information:
              </h4>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• All products will be exported in CSV format</li>
                <li>• Includes all product fields and metadata</li>
                <li>• Compatible with Excel and other spreadsheet applications</li>
                <li>• Can be re-imported using the Import function</li>
              </ul>
            </div>

            {/* CSV Preview */}
            {csvData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Preview
                </label>
                <textarea
                  value={csvData.slice(0, 1000) + (csvData.length > 1000 ? '...' : '')}
                  readOnly
                  rows={8}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Showing first 1000 characters. Total length: {csvData.length} characters
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewExport}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {loading ? 'Loading...' : 'Preview'}
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-warm-orange hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                {loading ? 'Exporting...' : 'Download CSV'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImportExportModal;