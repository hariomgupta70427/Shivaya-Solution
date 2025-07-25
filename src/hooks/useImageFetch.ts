import { useState, useEffect } from 'react';
import { Product } from './useProducts';

// Default placeholder image if API fails or no results
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80';

// Cache to prevent repeated API calls for the same query
const imageCache: Record<string, string> = {};

// Preload common category images to improve initial loading performance
const PRELOADED_IMAGES: Record<string, string[]> = {
  'Metal Pens': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585336455962-4c98dbd2c911?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1561839561-b13843f8cd61?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1579487785973-74d2ca7d6b55?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Kitchen World': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585667270850-4d4e5ffe2d24?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1596466713836-26a253f33f3c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1630383249896-613f7a6a5d7f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Household Products': [
    'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1631871297972-3dbe4f8a2162?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Industrial Plastic Crates': [
    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1597106776019-b4ecc878c202?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1588625500633-a0cd518f0f60?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1598543521504-9150e1217709?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1607344645866-009c320c00d8?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1610978777933-4a18da357c2d?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Other Products': [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1570194065650-d99fb4ee7694?auto=format&fit=crop&w=800&h=600&q=80'
  ]
};

// Subcategory-specific images for better relevance
const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  // Metal Pens subcategories
  'Astral Series': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585336455962-4c98dbd2c911?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1583744946564-b52e5499e1c9?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Vertex Series': [
    'https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1561839561-b13843f8cd61?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1579487785973-74d2ca7d6b55?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Lumin Series': [
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1546695259-ad30ff3fd643?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1565980948404-ebb5a3c6e283?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1607006344380-b6775a0824ce?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Innovate Series': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc1b13a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1606636660801-c61b8e97a7b0?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1583744946564-b52e5499e1c9?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  
  // Kitchen World subcategories
  'Pressure Cooker': [
    'https://images.unsplash.com/photo-1585667270850-4d4e5ffe2d24?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1596466713836-26a253f33f3c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1544233726-9f1d0ac65ccb?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1588778272105-1ff4b41dfe61?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Gas Stove': [
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1586277641374-5150b9e6e3c4?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Thermoware': [
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1522712398875-d039da453f14?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1577717904384-5094527d608c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1578898887932-dce23a595ad4?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Cookware': [
    'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584477712087-69fa7e911b86?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584283070957-7ddd7fec7b44?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Idli Pot': [
    'https://images.unsplash.com/photo-1630383249896-613f7a6a5d7f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1627662168223-7df99068099a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1630383249838-460254fffce6?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Barbeque': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1593164842264-854604db2260?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1523986490752-c28064f26be3?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  
  // Household Products subcategories
  'Water Buckets': [
    'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1631871297972-3dbe4f8a2162?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Bath Mug': [
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Plastic Stool': [
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1579656450812-5b0da674a635?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  
  // Industrial Plastic Crates subcategories
  '300 x 200 Series': [
    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1588625500633-a0cd518f0f60?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1598543521504-9150e1217709?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  '400 x 300 Series': [
    'https://images.unsplash.com/photo-1597106776019-b4ecc878c202?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1607344645866-009c320c00d8?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  '500 x 325 Series': [
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1610978777933-4a18da357c2d?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1598543522815-2e2c85f8b3fe?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  
  // Other Products subcategories
  'Soap Dispensers': [
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1598131349553-cb1bd962c08e?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Toilet Accessories': [
    'https://images.unsplash.com/photo-1570194065650-d99fb4ee7694?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Premium Cookware': [
    'https://images.unsplash.com/photo-1584487465298-4a57f2068dc6?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556909190-10e67263412c?auto=format&fit=crop&w=800&h=600&q=80'
  ]
};

// Preload images for better performance
function preloadImages() {
  try {
    Object.values(PRELOADED_IMAGES).forEach(categoryImages => {
      categoryImages.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    });
    
    Object.values(SUBCATEGORY_IMAGES).forEach(subcategoryImages => {
      subcategoryImages.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    });
    console.log('Images preloaded successfully');
  } catch (error) {
    console.error('Error preloading images:', error);
  }
}

// Call preload function immediately
preloadImages();

/**
 * Extract relevant keywords from product description and attributes
 */
function extractKeywords(product: Product): string[] {
  const keywords: string[] = [];
  
  // Add name
  if (product.name) {
    keywords.push(...product.name.toLowerCase().split(/\s+/));
  }
  
  // Add category and subcategory
  if (product.category) {
    keywords.push(product.category.toLowerCase());
  }
  
  if (product.subcategory) {
    keywords.push(product.subcategory.toLowerCase());
  }
  
  // Add material
  if (product.material) {
    keywords.push(product.material.toLowerCase());
  }
  
  // Add series
  if (product.series) {
    keywords.push(product.series.toLowerCase());
  }
  
  // Add brand
  if (product.brand) {
    keywords.push(product.brand.toLowerCase());
  }
  
  // Extract keywords from description
  if (product.description) {
    // Extract key nouns and adjectives from description
    const descWords = product.description.toLowerCase().match(/\b(\w{3,})\b/g) || [];
    keywords.push(...descWords.slice(0, 5)); // Add up to 5 significant words
  }
  
  // Add features
  if (product.features && product.features.length > 0) {
    // Extract key terms from features
    product.features.forEach(feature => {
      const featureWords = feature.toLowerCase().match(/\b(\w{3,})\b/g) || [];
      keywords.push(...featureWords.slice(0, 2)); // Add up to 2 words from each feature
    });
  }
  
  // Add models if available
  if (product.models && product.models.length > 0) {
    product.models.forEach(model => {
      if (model.name) {
        keywords.push(model.name.toLowerCase());
      }
    });
  }
  
  // Filter out common stopwords and duplicates
  const stopwords = ['and', 'the', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'will', 'have', 'has', 'not', 'but'];
  return [...new Set(keywords)]
    .filter(word => !stopwords.includes(word))
    .slice(0, 8); // Limit to 8 most relevant keywords
}

/**
 * Create a relevant query for the image API
 */
function createImageQuery(product: Product): string {
  const keywords = extractKeywords(product);
  
  // Create a concise, targeted query based on product type
  let baseQuery = '';
  
  if (product.category.toLowerCase().includes('pen')) {
    baseQuery = 'metal pen,writing,stationery';
  } else if (product.category.toLowerCase().includes('kitchen')) {
    baseQuery = 'cookware,kitchen,utensil';
  } else if (product.category.toLowerCase().includes('household')) {
    baseQuery = 'household,home,appliance';
  } else if (product.category.toLowerCase().includes('crate')) {
    baseQuery = 'storage,crate,container,plastic';
  } else if (product.category.toLowerCase().includes('amenities')) {
    baseQuery = 'hotel,amenity,hospitality';
  } else {
    baseQuery = 'product,retail';
  }
  
  // Add more specific queries based on subcategory
  if (product.subcategory) {
    const subcategory = product.subcategory.toLowerCase();
    
    // Metal Pens subcategories
    if (subcategory.includes('astral')) {
      baseQuery = 'luxury metal pen,premium pen';
    } else if (subcategory.includes('vertex')) {
      baseQuery = 'executive metal pen,business pen';
    } else if (subcategory.includes('lumin')) {
      baseQuery = 'sleek metal pen,modern pen';
    } else if (subcategory.includes('innovate')) {
      baseQuery = 'innovative pen,unique pen design';
    }
    
    // Kitchen World subcategories
    else if (subcategory.includes('pressure cooker')) {
      baseQuery = 'pressure cooker,kitchen appliance';
    } else if (subcategory.includes('gas stove')) {
      baseQuery = 'gas stove,kitchen burner';
    } else if (subcategory.includes('thermoware')) {
      baseQuery = 'thermos,insulated container';
    } else if (subcategory.includes('cookware')) {
      baseQuery = 'cookware set,pots and pans';
    } else if (subcategory.includes('idli')) {
      baseQuery = 'idli maker,steamer pot';
    } else if (subcategory.includes('barbeque')) {
      baseQuery = 'barbecue grill,bbq';
    }
    
    // Household Products subcategories
    else if (subcategory.includes('bucket')) {
      baseQuery = 'plastic bucket,water container';
    } else if (subcategory.includes('mug')) {
      baseQuery = 'bath mug,plastic mug';
    } else if (subcategory.includes('stool')) {
      baseQuery = 'plastic stool,step stool';
    }
    
    // Industrial Plastic Crates subcategories
    else if (subcategory.includes('300 x 200')) {
      baseQuery = 'small plastic crate,storage bin';
    } else if (subcategory.includes('400 x 300')) {
      baseQuery = 'medium plastic crate,storage container';
    } else if (subcategory.includes('500 x 325')) {
      baseQuery = 'large plastic crate,industrial container';
    }
  }
  
  // Add the most specific keywords from our extracted list
  const specificQuery = keywords.slice(0, 3).join(',');
  
  return `${specificQuery},${baseQuery}`;
}

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
 * Get a predefined image based on product category and subcategory
 */
function getPredefinedImage(product: Product): string | null {
  try {
    // Generate a unique seed for this product
    const productSeed = hashCode(`${product.id}-${product.name}-${product.description || ''}`);
    
    // First, try to find a subcategory-specific image
    if (product.subcategory && SUBCATEGORY_IMAGES[product.subcategory]) {
      const images = SUBCATEGORY_IMAGES[product.subcategory];
      // Use product ID to create a consistent but unique index
      return images[productSeed % images.length];
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
    
    // Fall back to category images with a unique index based on product properties
    if (PRELOADED_IMAGES[product.category]) {
      const images = PRELOADED_IMAGES[product.category];
      // Use different properties to create variety
      const variantSeed = hashCode(`${product.name}-${product.id}-${Date.now() % 1000}`);
      return images[variantSeed % images.length];
    }
    
    // If we still don't have a match, try to find any category that might be similar
    const categoryLower = product.category.toLowerCase();
    for (const [key, images] of Object.entries(PRELOADED_IMAGES)) {
      const keyLower = key.toLowerCase();
      
      if (categoryLower.includes(keyLower) || keyLower.includes(categoryLower)) {
        const altSeed = hashCode(`${product.id}-${product.name}-${key}`);
        return images[altSeed % images.length];
      }
    }
  } catch (error) {
    console.error('Error getting predefined image:', error);
  }
  
  // Return a default image if all else fails
  return DEFAULT_IMAGE;
}

/**
 * Try to fetch an image from the Unsplash API
 */
async function fetchUnsplashImage(query: string, seed: number): Promise<string | null> {
  try {
    const unsplashUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(query)}&sig=${seed}`;
    
    const controller = new AbortController();
    const fetchTimeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(unsplashUrl, { 
      signal: controller.signal,
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(fetchTimeoutId);
    
    if (response.ok) {
      return response.url;
    }
  } catch (error) {
    console.warn('Failed to fetch from Unsplash:', error);
  }
  
  return null;
}

/**
 * Custom hook to fetch a relevant image for a product
 */
export function useImageFetch(product: Product) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a more unique cache key for this product
  const cacheKey = `${product.id}-${product.name}-${product.category}-${product.subcategory || ''}-${product.description?.substring(0, 20) || ''}`;

  useEffect(() => {
    // Set a timeout to show default image if fetching takes too long
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Image fetch timeout, using default image');
        // Try to get a predefined image before falling back to default
        const predefinedImage = getPredefinedImage(product);
        setImageUrl(predefinedImage || DEFAULT_IMAGE);
        setIsLoading(false);
      }
    }, 1500); // 1.5 second timeout for better UX
    
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        
        // Check if we should bypass cache for this product to ensure variety
        // Use the product ID to create a deterministic but varied behavior
        const shouldBypassCache = hashCode(product.id) % 5 === 0; // 20% chance of bypassing cache
        
        // Check cache first for fast loading (unless bypassing)
        if (!shouldBypassCache && imageCache[cacheKey]) {
          setImageUrl(imageCache[cacheKey]);
          setIsLoading(false);
          setError(null);
          clearTimeout(timeoutId);
          return;
        }
        
        // Try to get a predefined image first (fastest option)
        const predefinedImage = getPredefinedImage(product);
        if (predefinedImage) {
          // Only cache if not bypassing
          if (!shouldBypassCache) {
            imageCache[cacheKey] = predefinedImage;
          }
          setImageUrl(predefinedImage);
          setIsLoading(false);
          setError(null);
          clearTimeout(timeoutId);
          return;
        }
        
        // Try to fetch from Unsplash with a unique query
        const query = createImageQuery(product);
        // Use current timestamp to ensure variety in the seed
        const seed = hashCode(cacheKey + Date.now().toString().slice(-4));
        const unsplashImage = await fetchUnsplashImage(query, seed);
        
        if (unsplashImage) {
          // Only cache if not bypassing
          if (!shouldBypassCache) {
            imageCache[cacheKey] = unsplashImage;
          }
          setImageUrl(unsplashImage);
          setIsLoading(false);
          setError(null);
          clearTimeout(timeoutId);
          return;
        }
        
        // If all else fails, use a varied default image from the category
        const categoryImages = PRELOADED_IMAGES[product.category] || PRELOADED_IMAGES['Other Products'];
        // Use product properties + timestamp to get a varied index
        const variedIndex = Math.abs(hashCode(`${product.id}-${Date.now() % 10000}`)) % categoryImages.length;
        const fallbackImage = categoryImages[variedIndex];
        
        // Only cache if not bypassing
        if (!shouldBypassCache) {
          imageCache[cacheKey] = fallbackImage;
        }
        setImageUrl(fallbackImage);
        setIsLoading(false);
        setError(null);
        clearTimeout(timeoutId);
        
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to fetch image');
        // Use predefined image as fallback
        const predefinedImage = getPredefinedImage(product);
        setImageUrl(predefinedImage || DEFAULT_IMAGE);
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };
    
    fetchImage();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [product.id, product.name, product.category, product.subcategory, cacheKey, isLoading]);
  
  return { imageUrl, isLoading, error };
} 