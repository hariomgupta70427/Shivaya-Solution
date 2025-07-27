import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/admin/Layout';
import CategoryForm from '../../components/admin/CategoryForm';
import { createCategory } from '../../services/productService';
import { Category } from '../../types/product';
import toast from 'react-hot-toast';

const AddCategory: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (categoryData: Omit<Category, 'id'>) => {
    try {
      setIsSubmitting(true);
      await createCategory(categoryData);
      toast.success('Category created successfully');
      navigate('/admin/categories');
    } catch (error) {
      toast.error('Failed to create category');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Category</h1>
          <button
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <CategoryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </Layout>
  );
};

export default AddCategory; 