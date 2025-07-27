import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/admin/Layout';
import CategoryForm from '../../components/admin/CategoryForm';
import { getCategories, updateCategory } from '../../services/productService';
import { Category } from '../../types/product';
import toast from 'react-hot-toast';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const EditCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const categories = await getCategories();
        const foundCategory = categories.find((c) => c.id === Number(id));
        
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        setError('Failed to load category');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (categoryData: Omit<Category, 'id'>) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateCategory(Number(id), categoryData);
      toast.success('Category updated successfully');
      navigate('/admin/categories');
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-warm-orange"></div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-6 w-6 text-red-400 dark:text-red-500 mr-3" />
          <p className="text-red-700 dark:text-red-400">{error || 'Category not found'}</p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
          >
            Back to Categories
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
          <button
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-warm-orange"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <CategoryForm category={category} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </Layout>
  );
};

export default EditCategory; 