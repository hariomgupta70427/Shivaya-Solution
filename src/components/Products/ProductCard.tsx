import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Eye } from 'lucide-react';
import { Product } from '../../hooks/useProducts';
import { COMPANY_INFO } from '../../utils/constants';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  index: number;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onViewDetails }) => {
  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(
      `Hi ${COMPANY_INFO.name}, I'm interested in "${product.name}". Please provide more details about pricing and availability.`
    );
    window.open(`https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${message}`, '_blank');
  };

  // Format display of models if available
  const formatModels = () => {
    if (product.models && product.models.length > 0) {
      const modelNumbers = product.models.map(model => model.model_no).join(', ');
      return `Includes ${product.models.length} models: ${modelNumbers}`;
    }
    return null;
  };

  // Format variants if available
  const formatVariants = () => {
    if (product.variants) {
      if (Array.isArray(product.variants) && typeof product.variants[0] === 'string') {
        return `Variants: ${(product.variants as string[]).join(', ')}`;
      }
      // If variants are objects with more complex structure
      return `Available in multiple variants`;
    }
    return null;
  };

  // Format sizes if available
  const formatSizes = () => {
    if (product.sizes && product.sizes.length > 0) {
      return `Sizes: ${product.sizes.join(', ')}`;
    }
    return null;
  };

  // Format dimensions if available
  const formatDimensions = () => {
    if (product.outer_dimension) {
      return `Dimensions: ${product.outer_dimension}`;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <ProductImage 
          product={product}
          className="w-full h-full"
          alt={product.name}
          showRefreshButton={true}
          priority="normal"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-block px-3 py-1 bg-brand-warm-orange text-white text-xs font-medium rounded-full">
            {product.subcategory.toUpperCase()}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            onClick={() => onViewDetails?.(product)}
            className="bg-white/90 text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Eye className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {product.name}
          {product.brand && <span className="text-sm text-gray-500 ml-2">{product.brand}</span>}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {product.description}
        </p>
        
        {/* Additional product details */}
        <div className="mb-4 space-y-1">
          {formatModels() && (
            <p className="text-sm text-gray-500">{formatModels()}</p>
          )}
          {formatVariants() && (
            <p className="text-sm text-gray-500">{formatVariants()}</p>
          )}
          {formatSizes() && (
            <p className="text-sm text-gray-500">{formatSizes()}</p>
          )}
          {formatDimensions() && (
            <p className="text-sm text-gray-500">{formatDimensions()}</p>
          )}
          {product.capacity_l && (
            <p className="text-sm text-gray-500">Capacity: {product.capacity_l}L</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handleWhatsAppInquiry}
            className="flex items-center space-x-2 bg-brand-deep-mustard hover:bg-brand-burnt-coral text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Inquire</span>
          </button>
          <button 
            onClick={() => onViewDetails?.(product)}
            className="text-brand-warm-orange hover:text-brand-deep-mustard font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;