import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

const ProductCategories: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-cream to-brand-beige dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-brand-cream mb-4">
            Our Product Categories
          </h2>
          <p className="text-xl text-gray-600 dark:text-brand-beige">
            Explore our comprehensive range of quality products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCT_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group h-full"
            >
              <Link
                to={`/products?category=${category.id}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-brand-beige dark:border-gray-700 btn-glow h-full flex flex-col"
              >
                <div className="text-center flex flex-col flex-grow justify-between h-full">
                  <div>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-brand-cream mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-brand-beige mb-4">
                      {category.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="inline-flex items-center text-brand-warm-orange font-medium group-hover:text-brand-mustard transition-colors">
                      View Products
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;