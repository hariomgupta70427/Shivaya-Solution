import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { COMPANY_INFO } from '../../utils/constants';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    // Navigate to contact page using React Router
    navigate('/contact');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-brand-beige to-brand-tan dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23D88E35%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-brand-cream mb-6"
          >
            <span className="block">{COMPANY_INFO.name}</span>
            <span className="block text-brand-warm-orange text-3xl md:text-4xl mt-2">
              {COMPANY_INFO.tagline}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-brand-beige mb-8 max-w-3xl mx-auto"
          >
            {COMPANY_INFO.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              to="/products"
              className="flex items-center space-x-2 bg-brand-warm-orange hover:bg-brand-mustard text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-2 border-2 border-brand-warm-orange text-brand-warm-orange hover:bg-brand-warm-orange hover:text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              <span>Get Quote</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cream dark:bg-gray-800 rounded-full mb-4">
                <Shield className="h-8 w-8 text-brand-mustard dark:text-brand-tan" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-brand-cream mb-2">
                ISO 9001:2015 Certified
              </h3>
              <p className="text-gray-600 dark:text-brand-beige">
                Quality management system certified for consistent excellence
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cream dark:bg-gray-800 rounded-full mb-4">
                <Truck className="h-8 w-8 text-brand-burnt-coral dark:text-brand-tan" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-brand-cream mb-2">
                Pan-India Delivery
              </h3>
              <p className="text-gray-600 dark:text-brand-beige">
                Fast and reliable delivery across all states in India
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cream dark:bg-gray-800 rounded-full mb-4">
                <Award className="h-8 w-8 text-brand-warm-orange dark:text-brand-tan" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-brand-cream mb-2">
                MSME Registered
              </h3>
              <p className="text-gray-600 dark:text-brand-beige">
                Government recognized small business supporting local economy
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;