import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../hooks/useProducts';

interface InquiryContextType {
  inquiryProduct: Product | null;
  setInquiryProduct: (product: Product | null) => void;
  generateInquiryMessage: (product: Product) => string;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};

interface InquiryProviderProps {
  children: ReactNode;
}

export const InquiryProvider: React.FC<InquiryProviderProps> = ({ children }) => {
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  const generateInquiryMessage = (product: Product): string => {
    let message = `Hello,\n\nI am interested in the following product:\n\n`;
    message += `Product Name: ${product.name}\n`;
    message += `Category: ${product.category}\n`;
    message += `Subcategory: ${product.subcategory}\n`;
    
    if (product.series) {
      message += `Series: ${product.series}\n`;
    }
    
    if (product.material) {
      message += `Material: ${product.material}\n`;
    }
    
    if (product.capacity_l) {
      message += `Capacity: ${product.capacity_l}L\n`;
    }
    
    if (product.outer_dimension) {
      message += `Dimensions: ${product.outer_dimension}\n`;
    }
    
    if (product.models && product.models.length > 0) {
      message += `Model: ${product.models[0].model_no} - ${product.models[0].name}\n`;
    }
    
    if (product.colors && product.colors.length > 0) {
      message += `Available Colors: ${product.colors.join(', ')}\n`;
    }
    
    if (product.sizes && product.sizes.length > 0) {
      message += `Available Sizes: ${product.sizes.join(', ')}\n`;
    }
    
    message += `\nDescription: ${product.description}\n\n`;
    message += `Please provide me with the following information:\n`;
    message += `- Pricing details\n`;
    message += `- Minimum order quantity\n`;
    message += `- Availability and delivery time\n`;
    message += `- Technical specifications (if any)\n`;
    message += `- Bulk pricing options\n\n`;
    message += `Thank you for your time. I look forward to hearing from you.\n\n`;
    message += `Best regards`;

    return message;
  };

  const value = {
    inquiryProduct,
    setInquiryProduct,
    generateInquiryMessage,
  };

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  );
};