import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, isSubmitting }) => {
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState<number | undefined>(product?.price);
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setDescription(product.description);
      setPrice(product.price);
      setImageUrl(product.image_url || '');
      setInStock(product.in_stock ?? true);
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (price !== undefined && price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productData: Omit<Product, 'id'> = {
      name,
      category,
      description,
      price,
      image_url: imageUrl,
      in_stock: inStock,
    };

    if (subcategory) {
      productData.subcategory = subcategory;
    }

    await onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Name *
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              errors.name
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-brand-warm-orange focus:border-brand-warm-orange'
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.name && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.name}</p>}
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category *
          </label>
          <div className="mt-1 relative">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.category
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-brand-warm-orange focus:border-brand-warm-orange'
              } dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select a category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
            )}
          </div>
          {errors.category && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subcategory (Optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <div className="mt-1 relative">
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              errors.description
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-brand-warm-orange focus:border-brand-warm-orange'
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.description && (
            <div className="absolute top-0 right-0 pr-3 pt-3 flex items-start pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.description}</p>}
      </div>

      {/* Price & Image URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price (Optional)
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="price"
              value={price === undefined ? '' : price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0.00"
              className={`block w-full pl-7 rounded-md shadow-sm sm:text-sm ${
                errors.price
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-brand-warm-orange focus:border-brand-warm-orange'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.price && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
            )}
          </div>
          {errors.price && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image URL (Optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="image_url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center">
        <input
          id="in_stock"
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="h-4 w-4 text-brand-warm-orange focus:ring-brand-warm-orange border-gray-300 dark:border-gray-600 rounded"
        />
        <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          In Stock
        </label>
      </div>

      {/* Preview */}
      {imageUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview</label>
          <div className="w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-warm-orange hover:bg-brand-mustard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : product ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 