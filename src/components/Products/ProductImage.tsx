import React, { useState, useEffect } from 'react';
import { useImageFetch } from '../../hooks/useImageFetch';
import { Product } from '../../hooks/useProducts';

interface ProductImageProps {
  product: Product;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  showLoader?: boolean;
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
 * ProductImage component that dynamically displays contextually appropriate images
 * for products based on their attributes.
 */
const ProductImage: React.FC<ProductImageProps> = ({
  product,
  className = '',
  alt = '',
  width,
  height,
  showLoader = true,
}) => {
  // Track image loading state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Get a direct image based on product attributes
  const directImage = getDirectImage(product);
  
  // Use our custom hook to fetch a relevant image if needed
  const { imageUrl, isLoading, error } = useImageFetch(product);
  
  // Determine the final image URL to display
  // Priority: 1. Direct image, 2. Fetched image, 3. Category-specific fallback
  const finalImageUrl = directImage || (error || !imageUrl || imageFailed ? 
    (product.category && CATEGORY_IMAGES[product.category] ? 
      CATEGORY_IMAGES[product.category][0] : 
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80') : 
    imageUrl);
  
  // Alt text defaults to product name if not provided
  const imageAlt = alt || `${product.name} - ${product.category}${product.subcategory ? ` - ${product.subcategory}` : ''}`;
  
  // Reset loading state if product changes
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
    setRetryCount(0);
  }, [product.id]);
  
  // Handle image error with retry logic
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount < 2) {
      // Try to reload the image up to 2 times
      setRetryCount(prev => prev + 1);
      const img = e.currentTarget;
      img.src = img.src.includes('?') ? 
        `${img.src}&retry=${retryCount}` : 
        `${img.src}?retry=${retryCount}`;
    } else {
      setImageFailed(true);
      // If image fails to load, use category-based fallback
      if (product.category && CATEGORY_IMAGES[product.category]) {
        const images = CATEGORY_IMAGES[product.category];
        e.currentTarget.src = images[0]; // Use first image as ultimate fallback
        setImageLoaded(true);
      } else {
        // Default fallback
        e.currentTarget.src = 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80';
        setImageLoaded(true);
      }
    }
  };
  
  return (
    <div className={`product-image-container relative ${className}`}>
      {/* Show loading spinner only if explicitly requested */}
      {isLoading && showLoader && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-brand-warm-orange rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={finalImageUrl}
        alt={imageAlt}
        width={width}
        height={height}
        className="w-full h-full object-cover transition-opacity duration-300"
        onLoad={() => {
          setImageLoaded(true);
        }}
        onError={handleImageError}
      />
    </div>
  );
};

export default ProductImage; 