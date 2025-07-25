import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { CORE_VALUES } from '../../utils/constants';

const AboutSnippet: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-l from-brand-beige to-brand-tan dark:bg-gradient-to-l dark:from-gray-800 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-brand-cream mb-6">
              Why Choose Shivaya Solutions?
            </h2>
            <p className="text-lg text-gray-600 dark:text-brand-beige mb-8">
              With years of experience in the industry, we have established ourselves as a trusted partner for businesses across India. Our commitment to quality, reliability, and customer satisfaction sets us apart in the market.
            </p>
            
            <div className="space-y-4 mb-8">
              {CORE_VALUES.map((value, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-brand-cream">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 dark:text-brand-beige">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center space-x-2 bg-brand-warm-orange hover:bg-brand-mustard text-white px-6 py-3 rounded-lg font-medium transition-colors btn-glow"
            >
              <span>Learn More About Us</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3862129/pexels-photo-3862129.jpeg"
                alt="Shivaya Solutions Team"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  Committed to Excellence
                </h3>
                <p className="text-white/90">
                  Delivering quality products and exceptional service to businesses across India
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSnippet;