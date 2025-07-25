export const COMPANY_INFO = {
  name: 'Shivaya Solutions',
  tagline: 'Your Trusted Partner in Quality Business Solutions',
  description: 'ISO 9001:2015 certified, MSME-registered Indian company supplying premium plasticware, kitchenware, industrial crates, hotel amenities, stationery, and gifting items across India.',
  phone: '+91 9899716237',
  email: 'shivayasolutions0167@gmail.com',
  address: 'Burari, New Delhi, India',
  whatsappNumber: '91982495462',
  socialMedia: {
    instagram: '#',
    linkedin: 'https://www.linkedin.com/in/shivaya-solutions-813663375/'
  }
};

// CSV Configuration - Update this URL to change the product data source
export const CSV_CONFIG = {
  url: 'https://your-actual-csv-link.com/products.csv', // 👈 YAHAN APNA CSV LINK DAAL DE
  autoFetch: true, // 👈 ISE TRUE KAR DE JAISE HI LINK DAAL DEGA
  refreshInterval: 300000 // 5 minutes in milliseconds
};

export const PRODUCT_CATEGORIES = [
  {
    id: 'plasticware',
    name: 'Plasticware',
    description: 'Durable plastic products for home and commercial use',
    icon: '🥤'
  },
  {
    id: 'kitchenware',
    name: 'Kitchenware',
    description: 'Essential kitchen tools and appliances',
    icon: '🍳'
  },
  {
    id: 'industrial-crates',
    name: 'Industrial Crates',
    description: 'Heavy-duty storage and transport solutions',
    icon: '📦'
  },
  {
    id: 'hotel-amenities',
    name: 'Hotel Amenities',
    description: 'Premium hospitality supplies and accessories',
    icon: '🏨'
  },
  {
    id: 'stationery',
    name: 'Stationery',
    description: 'Office and educational supplies',
    icon: '📝'
  },
  {
    id: 'gifting-items',
    name: 'Gifting Items',
    description: 'Corporate and personal gift solutions',
    icon: '🎁'
  }
];

export const CORE_VALUES = [
  {
    title: 'Affordable',
    description: 'Competitive pricing without compromising quality',
    icon: '💰'
  },
  {
    title: 'Durable',
    description: 'Long-lasting products built to withstand daily use',
    icon: '🛡️'
  },
  {
    title: 'Reliable',
    description: 'Trusted by businesses across India for consistent quality',
    icon: '⭐'
  }
];

export const CERTIFICATIONS = [
  'ISO 9001:2015 Certified',
  'MSME Registered',
  'Export Ready',
  'Quality Assured'
];

export const INDUSTRIES_SERVED = [
  'Hospitality', 'Manufacturing', 'Healthcare', 'Education', 
  'Retail', 'Food Service', 'Corporate', 'Government'
];