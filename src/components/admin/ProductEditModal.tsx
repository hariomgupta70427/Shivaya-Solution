import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types/product';
import { updateProduct, createProduct, getCategories } from '../../services/csvProductService';
import toast from 'react-hot-toast';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  mode: 'create' | 'edit';
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    price: undefined,
    image_url: '',
    in_stock: true,
    brand: '',
    series: '',
    material: '',
    features: '',
    specifications: '',
    dimensions: '',
    weight: '',
    color: '',
    model: '',
    sku: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        brand: product.brand || '',
        series: product.series || '',
        material: product.material || '',
        features: product.features || '',
        specifications: product.specifications || '',
        dimensions: product.dimensions || '',
        weight: product.weight || '',
        color: product.color || '',
        model: product.model || '',
        sku: product.sku || ''
      });
      setImagePreview(product.image_url || '');
    } else if (mode === 'create') {
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        price: undefined,
        image_url: '',
        in_stock: true,
        brand: '',
        series: '',
        material: '',
        features: '',
        specifications: '',
        dimensions: '',
        weight: '',
        color: '',
        model: '',
        sku: ''
      });
      setImagePreview('');
    }
  }, [product, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? (value ? parseFloat(value) : undefined) :
              value
    }));

    // Update image preview
    if (name === 'image_url') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.category?.trim()) {
      toast.error('Category is required');
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'edit' && product) {
        await updateProduct(product.id as number, formData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Product created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <div className="flex space-x-2">
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    required
                    className="flex-1 block border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    placeholder="Or enter new category"
                    className="flex-1 block border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory || ''}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter subcategory"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter price"
                />
              </div>

              {/* In Stock */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-brand-warm-orange focus:ring-brand-warm-orange border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                  In Stock
                </label>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter brand"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter SKU"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url || ''}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter image URL"
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
                
                {!imagePreview && (
                  <div className="mt-2 h-32 w-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product description"
                />
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material || ''}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                    placeholder="Material"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                    placeholder="Color"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions || ''}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                    placeholder="L x W x H"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                    placeholder="Weight"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Features
                </label>
                <textarea
                  name="features"
                  value={formData.features || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange dark:bg-gray-700 dark:text-white"
                  placeholder="Enter features (comma-separated)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-warm-orange hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange disabled:opacity-50"
            >
              {loading ? 'Saving...' : (mode === 'edit' ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;