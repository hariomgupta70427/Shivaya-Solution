import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Package, Info, Tag, Ruler, Weight } from 'lucide-react';
import { Product } from '../../types/product';
import { COMPANY_INFO } from '../../utils/constants';
import ProductImage from './ProductImage';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose 
}) => {
  if (!product) return null;

  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(
      `Hi ${COMPANY_INFO.name}, I'm interested in "${product.name}" (ID: ${product.id}). Please provide more details about pricing and availability.`
    );
    window.open(`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-warm-orange text-white">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {product.subcategory}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <ProductImage 
                      product={product}
                      className="w-full h-full object-cover"
                      alt={product.name}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleWhatsAppInquiry}
                      className="flex-1 flex items-center justify-center space-x-2 bg-brand-deep-mustard hover:bg-brand-burnt-coral text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Inquire on WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        <Info className="h-5 w-5 mr-2 text-brand-warm-orange" />
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Product Information */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      <Package className="h-5 w-5 mr-2 text-brand-warm-orange" />
                      Product Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.brand && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Brand:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.brand}
                          </span>
                        </div>
                      )}
                      
                      {product.series && (
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Series:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.series}
                          </span>
                        </div>
                      )}
                      
                      {product.model && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Model:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.model}
                          </span>
                        </div>
                      )}
                      
                      {product.sku && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">SKU:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.sku}
                          </span>
                        </div>
                      )}
                      
                      {product.material && (
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Material:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.material}
                          </span>
                        </div>
                      )}
                      
                      {product.color && (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                          <span className="text-sm text-gray-500">Color:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.color}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  {(product.dimensions || product.weight || product.capacity) && (
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        <Ruler className="h-5 w-5 mr-2 text-brand-warm-orange" />
                        Specifications
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.dimensions && (
                          <div className="flex items-center space-x-2">
                            <Ruler className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Dimensions:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.dimensions}
                            </span>
                          </div>
                        )}
                        
                        {product.weight && (
                          <div className="flex items-center space-x-2">
                            <Weight className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Weight:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.weight}
                            </span>
                          </div>
                        )}
                        
                        {product.capacity && (
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Capacity:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.capacity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {product.features && (
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        <Package className="h-5 w-5 mr-2 text-brand-warm-orange" />
                        Features
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {typeof product.features === 'string' ? (
                          <p>{product.features}</p>
                        ) : Array.isArray(product.features) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {product.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Variants */}
                  {product.variants && (
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        <Package className="h-5 w-5 mr-2 text-brand-warm-orange" />
                        Available Variants
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {typeof product.variants === 'string' ? (
                          <p>{product.variants}</p>
                        ) : Array.isArray(product.variants) ? (
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              >
                                {variant}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsModal;