import React, { useState, useEffect } from 'react';
import { Category } from '../../types/product';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Omit<Category, 'id'>) => Promise<void>;
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, isSubmitting }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [icon, setIcon] = useState(category?.icon || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setIcon(category.icon || '');
    }
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const categoryData: Omit<Category, 'id'> = {
      name,
      description,
      icon,
    };

    await onSubmit(categoryData);
  };

  // Common emoji options for icons
  const emojiOptions = [
    '🥤', '🍳', '📦', '🏨', '📝', '🎁', '🧹', '🧼', '🪣', '🧴',
    '🍽️', '🥄', '🍴', '🥢', '🥣', '🧊', '🥡', '🥂', '🧃', '🧉'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category Name *
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

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Icon */}
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Icon (Emoji)
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🛒"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-warm-orange focus:border-brand-warm-orange sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-xl ${
                icon === emoji ? 'bg-brand-warm-orange text-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

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
          ) : category ? (
            'Update Category'
          ) : (
            'Create Category'
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 