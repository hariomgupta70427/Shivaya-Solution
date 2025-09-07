import React, { useState, useEffect } from 'react';
import { RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useImageFetch } from '../../hooks/useImageFetch';
import { Product } from '../../hooks/useProducts';

interface ProductImageProps {
  product: Product;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  showLoader?: boolean;
  showRefreshButton?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

// Direct category-specific image mapping with highly relevant images only
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Metal Pens': [
    // Only pen-related images for Metal Pens category
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80', // blue metal pen
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&h=600&q=80', // silver pen on paper
    'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=800&h=600&q=80', // luxury pen close-up
    'https://images.unsplash.com/photo-1583744946564-b52e5499e1c9?auto=format&fit=crop&w=800&h=600&q=80', // pen on notebook
    'https://images.unsplash.com/photo-1606636660801-c61b8e97a7b0?auto=format&fit=crop&w=800&h=600&q=80', // fountain pen writing
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=800&h=600&q=80', // metal pen close-up
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&h=600&q=80'  // pen on document
  ],
  'Kitchen World': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600&q=80', // kitchen cookware
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&h=600&q=80', // gas stove
    'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80', // cooking pot
    'https://images.unsplash.com/photo-1585667270850-4d4e5ffe2d24?auto=format&fit=crop&w=800&h=600&q=80', // pressure cooker
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&h=600&q=80'  // kitchen appliance
  ],
  'Household Products': [
    'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c?auto=format&fit=crop&w=800&h=600&q=80', // plastic bucket
    'https://images.unsplash.com/photo-1631871297972-3dbe4f8a2162?auto=format&fit=crop&w=800&h=600&q=80', // household items
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&h=600&q=80', // plastic stool
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80', // bathroom items
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80'  // bath mug
  ],
  'Industrial Plastic Crates': [
    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&h=600&q=80', // plastic crates
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&h=600&q=80', // stacked crates
    'https://images.unsplash.com/photo-1598543521504-9150e1217709?auto=format&fit=crop&w=800&h=600&q=80', // industrial container
    'https://images.unsplash.com/photo-1588625500633-a0cd518f0f60?auto=format&fit=crop&w=800&h=600&q=80', // storage boxes
    'https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa?auto=format&fit=crop&w=800&h=600&q=80'  // plastic storage
  ],
  'Other Products': [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80', // general products
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&h=600&q=80', // toiletries
    'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&w=800&h=600&q=80', // soap dispenser
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=800&h=600&q=80', // bathroom items
    'https://images.unsplash.com/photo-1570194065650-d99fb4ee7694?auto=format&fit=crop&w=800&h=600&q=80'  // toilet accessories
  ]
};

// Direct subcategory-specific image mapping with highly relevant images
const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  // Metal Pens subcategories - only pen images
  'Astral Series': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80', // blue metal pen
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&h=600&q=80', // pen on document
    'https://images.unsplash.com/photo-1585336455962-4c98dbd2c911?auto=format&fit=crop&w=800&h=600&q=80'  // luxury pen
  ],
  'Vertex Series': [
    'https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=800&h=600&q=80', // pen set
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&h=600&q=80', // silver pen
    'https://images.unsplash.com/photo-1561839561-b13843f8cd61?auto=format&fit=crop&w=800&h=600&q=80'  // pen tip close-up
  ],
  'Lumin Series': [
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=800&h=600&q=80', // pen writing
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&h=600&q=80', // fountain pen
    'https://images.unsplash.com/photo-1546695259-ad30ff3fd643?auto=format&fit=crop&w=800&h=600&q=80'  // pen on desk
  ],
  'Innovate Series': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80', // blue metal pen
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=800&h=600&q=80', // metal pen close-up
    'https://images.unsplash.com/photo-1606636660801-c61b8e97a7b0?auto=format&fit=crop&w=800&h=600&q=80'  // fountain pen writing
  ],
  
  // Kitchen World subcategories
  'Pressure Cooker': [
    'https://images.unsplash.com/photo-1585667270850-4d4e5ffe2d24?auto=format&fit=crop&w=800&h=600&q=80', // pressure cooker
    'https://images.unsplash.com/photo-1596466713836-26a253f33f3c?auto=format&fit=crop&w=800&h=600&q=80', // pressure cooker lid
    'https://images.unsplash.com/photo-1544233726-9f1d0ac65ccb?auto=format&fit=crop&w=800&h=600&q=80'  // cooking pot
  ],
  'Gas Stove': [
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&h=600&q=80', // gas stove
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=600&q=80', // kitchen stove
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&h=600&q=80'  // cooking on stove
  ],
  'Thermoware': [
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&h=600&q=80', // thermos
    'https://images.unsplash.com/photo-1522712398875-d039da453f14?auto=format&fit=crop&w=800&h=600&q=80', // thermal container
    'https://images.unsplash.com/photo-1577717904384-5094527d608c?auto=format&fit=crop&w=800&h=600&q=80'  // thermos flask
  ],
  'Cookware': [
    'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80', // cooking pot
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600&q=80', // cookware set
    'https://images.unsplash.com/photo-1584477712087-69fa7e911b86?auto=format&fit=crop&w=800&h=600&q=80'  // pots and pans
  ],
  
  // Household Products subcategories
  'Water Buckets': [
    'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c?auto=format&fit=crop&w=800&h=600&q=80', // plastic bucket
    'https://images.unsplash.com/photo-1631871297972-3dbe4f8a2162?auto=format&fit=crop&w=800&h=600&q=80', // water bucket
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80'  // cleaning bucket
  ],
  'Bath Mug': [
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80', // bath mug
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&h=600&q=80', // plastic mug
    'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&h=600&q=80'  // bathroom items
  ],
  
  // Industrial Plastic Crates subcategories
  '300 x 200 Series': [
    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&h=600&q=80', // small plastic crates
    'https://images.unsplash.com/photo-1588625500633-a0cd518f0f60?auto=format&fit=crop&w=800&h=600&q=80', // storage boxes
    'https://images.unsplash.com/photo-1598543521504-9150e1217709?auto=format&fit=crop&w=800&h=600&q=80'  // stacked containers
  ],
  '400 x 300 Series': [
    'https://images.unsplash.com/photo-1597106776019-b4ecc878c202?auto=format&fit=crop&w=800&h=600&q=80', // medium plastic crates
    'https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa?auto=format&fit=crop&w=800&h=600&q=80', // storage container
    'https://images.unsplash.com/photo-1607344645866-009c320c00d8?auto=format&fit=crop&w=800&h=600&q=80'  // plastic box
  ],
  '500 x 325 Series': [
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&h=600&q=80', // large plastic crates
    'https://images.unsplash.com/photo-1610978777933-4a18da357c2d?auto=format&fit=crop&w=800&h=600&q=80', // industrial container
    'https://images.unsplash.com/photo-1598543522815-2e2c85f8b3fe?auto=format&fit=crop&w=800&h=600&q=80'  // stacked crates
  ]
};

// Additional product-specific images for exact matches
const PRODUCT_SPECIFIC_IMAGES: Record<string, string> = {
  // Metal Pens - specific models
  'Astral Gold': 'https://images.unsplash.com/photo-1583744946564-b52e5499e1c9?auto=format&fit=crop&w=800&h=600&q=80',
  'Astral Silver': 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&h=600&q=80',
  'Vertex Blue': 'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80',
  'Lumin Executive': 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&h=600&q=80',
  
  // Kitchen World - specific products
  'Premium Pressure Cooker': 'https://images.unsplash.com/photo-1585667270850-4d4e5ffe2d24?auto=format&fit=crop&w=800&h=600&q=80',
  'Deluxe Gas Stove': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&h=600&q=80',
  'Steel Cookware Set': 'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80',
  
  // Household Products - specific products
  'Jumbo Water Bucket': 'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c?auto=format&fit=crop&w=800&h=600&q=80',
  'Bathroom Mug Set': 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80',
  
  // Industrial Plastic Crates - specific models
  '300x200 Stackable': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&h=600&q=80',
  '400x300 Heavy Duty': 'https://images.unsplash.com/photo-1597106776019-b4ecc878c202?auto=format&fit=crop&w=800&h=600&q=80'
};

/**
 * Simple string hash function for creating a seed
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a direct image based on product attributes
 */
function getDirectImage(product: Product): string | null {
  // First check for exact product name match
  if (product.name && PRODUCT_SPECIFIC_IMAGES[product.name]) {
    return PRODUCT_SPECIFIC_IMAGES[product.name];
  }
  
  // Check if we have a direct match for the subcategory
  if (product.subcategory && SUBCATEGORY_IMAGES[product.subcategory]) {
    const images = SUBCATEGORY_IMAGES[product.subcategory];
    // Use product ID and name to create a consistent but unique index
    const seed = hashCode(`${product.id}-${product.name}`);
    return images[seed % images.length];
  }
  
  // For Metal Pens category, always use pen images
  if (product.category === 'Metal Pens') {
    const penImages = CATEGORY_IMAGES['Metal Pens'];
    const seed = hashCode(`${product.id}-${product.name}-${product.description || ''}`);
    return penImages[seed % penImages.length];
  }
  
  // Check for similar subcategories if exact match not found
  if (product.subcategory) {
    const subcategoryLower = product.subcategory.toLowerCase();
    
    // Find subcategories that might be similar
    for (const [key, images] of Object.entries(SUBCATEGORY_IMAGES)) {
      const keyLower = key.toLowerCase();
      
      // Check if subcategory contains any words from the key
      const keyWords = keyLower.split(/\s+/);
      const subcatWords = subcategoryLower.split(/\s+/);
      
      const hasMatch = keyWords.some(word => 
        subcatWords.some(subWord => 
          subWord.includes(word) || word.includes(subWord)
        )
      );
      
      if (hasMatch) {
        // Use a different hash calculation to ensure variety
        const altSeed = hashCode(`${product.id}-${key}`);
        return images[altSeed % images.length];
      }
    }
  }
  
  // Fall back to category images
  if (product.category && CATEGORY_IMAGES[product.category]) {
    const images = CATEGORY_IMAGES[product.category];
    // Use product name to create a consistent but unique index
    const seed = hashCode(`${product.id}-${product.name}-${product.description || ''}`);
    return images[seed % images.length];
  }
  
  // If we still don't have a match, try to find any category that might be similar
  if (product.category) {
    const categoryLower = product.category.toLowerCase();
    for (const [key, images] of Object.entries(CATEGORY_IMAGES)) {
      const keyLower = key.toLowerCase();
      
      if (categoryLower.includes(keyLower) || keyLower.includes(categoryLower)) {
        const altSeed = hashCode(`${product.id}-${product.name}-${key}`);
        return images[altSeed % images.length];
      }
    }
  }
  
  return null;
}

/**
 * Enhanced ProductImage component with real-time scraping capabilities
 */
const ProductImage: React.FC<ProductImageProps> = ({
  product,
  className = '',
  alt = '',
  width,
  height,
  showLoader = true,
  showRefreshButton = false,
  priority = 'normal'
}) => {
  // Track image loading and error states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get a direct image based on product attributes as immediate fallback
  const directImage = getDirectImage(product);
  
  // Use our enhanced hook to fetch real-time scraped images
  const { imageUrl, isLoading, error } = useImageFetch(product);
  
  // Determine the final image URL to display
  // Priority: 1. Scraped image from API, 2. Direct predefined image, 3. Category fallback
  const finalImageUrl = (!error && imageUrl && !imageFailed) ? imageUrl : 
    (directImage || 
     (product.category && CATEGORY_IMAGES[product.category] ? 
      CATEGORY_IMAGES[product.category][0] : 
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80'));
  
  // Enhanced alt text with more context
  const imageAlt = alt || `${product.name} - ${product.category}${product.subcategory ? ` - ${product.subcategory}` : ''} product image`;
  
  // Reset states when product changes
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
    setRetryCount(0);
  }, [product.id, refreshKey]);
  
  // Enhanced error handling with smart retry logic
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Image load failed for ${product.name}, attempt ${retryCount + 1}`);
    
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      const img = e.currentTarget;
      
      // Try different image sources on retry
      if (retryCount === 0 && directImage) {
        img.src = directImage;
      } else if (retryCount === 1 && product.category && CATEGORY_IMAGES[product.category]) {
        const images = CATEGORY_IMAGES[product.category];
        const fallbackIndex = Math.floor(Math.random() * images.length);
        img.src = images[fallbackIndex];
      } else {
        // Final fallback
        img.src = 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80';
      }
    } else {
      setImageFailed(true);
      setImageLoaded(true); // Stop loading state
    }
  };
  
  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setImageLoaded(false);
    setImageFailed(false);
    setRetryCount(0);
  };
  
  // Determine loading priority for performance optimization
  const loading = priority === 'high' ? 'eager' : 'lazy';
  
  return (
    <div className={`product-image-container relative group ${className}`}>
      {/* Enhanced loading indicator */}
      {isLoading && showLoader && !imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <RefreshCw className="w-8 h-8 text-brand-warm-orange animate-spin mb-2" />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
            {error ? 'Loading fallback...' : 'Fetching real-time image...'}
          </div>
        </div>
      )}
      
      {/* Error state indicator */}
      {imageFailed && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
            Image unavailable
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={finalImageUrl}
        alt={imageAlt}
        width={width}
        height={height}
        loading={loading}
        className={`w-full h-full object-cover transition-all duration-500 rounded-lg ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${imageFailed ? 'opacity-50' : ''}`}
        onLoad={() => {
          setImageLoaded(true);
          console.log(`Image loaded successfully for: ${product.name}`);
        }}
        onError={handleImageError}
      />
      
      {/* Image source indicator */}
      {imageLoaded && !error && imageUrl && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>Live</span>
          </div>
        </div>
      )}
      
      {/* Refresh button */}
      {showRefreshButton && (
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50"
          title="Refresh image"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      )}
      
      {/* Loading progress bar for real-time scraping */}
      {isLoading && !imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div className="h-full bg-brand-warm-orange animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ProductImage; 