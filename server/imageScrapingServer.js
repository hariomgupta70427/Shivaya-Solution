const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Cache for storing scraped images (TTL: 24 hours)
const imageCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Rate limiting to prevent overwhelming search engines
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// User agents to rotate for scraping
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

// Rate limiting middleware
function checkRateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimiter.has(clientIP)) {
    rateLimiter.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimiter.get(clientIP);
  
  if (now > clientData.resetTime) {
    rateLimiter.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }
  
  clientData.count++;
  rateLimiter.set(clientIP, clientData);
  next();
}

// Utility function to get random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Utility function to clean and optimize search query
function optimizeSearchQuery(query) {
  // Remove special characters and normalize spacing
  const cleaned = query
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  
  // Add relevant keywords for better image results
  const keywords = ['product', 'high quality', 'commercial'];
  const optimized = `${cleaned} ${keywords[Math.floor(Math.random() * keywords.length)]}`;
  
  return encodeURIComponent(optimized);
}

// Google Images scraper using Puppeteer (more reliable)
async function scrapeGoogleImagesPuppeteer(query, maxImages = 5) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to Google Images
    const searchUrl = `https://www.google.com/search?q=${optimizeSearchQuery(query)}&tbm=isch&safe=active`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

    // Wait for images to load
    await page.waitForSelector('img[data-src], img[src]', { timeout: 5000 });

    // Scroll to load more images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract image URLs
    const imageUrls = await page.evaluate((maxImages) => {
      const images = [];
      const imgElements = document.querySelectorAll('img');
      
      for (let img of imgElements) {
        if (images.length >= maxImages) break;
        
        const src = img.src || img.dataset.src;
        if (src && 
            src.startsWith('http') && 
            !src.includes('logo') && 
            !src.includes('avatar') &&
            !src.includes('icon') &&
            src.includes('image') &&
            (src.includes('gstatic') || src.includes('googleusercontent') || !src.includes('google'))) {
          
          // Prefer larger images
          if (src.includes('s=') || src.includes('w=') || src.includes('h=')) {
            images.push(src.replace(/[sw]=\d+/g, 's=800'));
          } else {
            images.push(src);
          }
        }
      }
      
      return images;
    }, maxImages);

    console.log(`Found ${imageUrls.length} images for query: ${query}`);
    return imageUrls.filter(url => url && url.length > 10);

  } catch (error) {
    console.error('Google Images Puppeteer scraping error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Bing Images scraper using Puppeteer
async function scrapeBingImagesPuppeteer(query, maxImages = 5) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to Bing Images
    const searchUrl = `https://www.bing.com/images/search?q=${optimizeSearchQuery(query)}&form=HDRSC2&first=1&cw=1177&ch=581`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

    // Wait for images to load
    await page.waitForSelector('.iusc', { timeout: 5000 });

    // Extract image URLs from Bing's data structure
    const imageUrls = await page.evaluate((maxImages) => {
      const images = [];
      const imgContainers = document.querySelectorAll('.iusc');
      
      for (let container of imgContainers) {
        if (images.length >= maxImages) break;
        
        try {
          const dataStr = container.getAttribute('m');
          if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data.murl && data.murl.startsWith('http')) {
              images.push(data.murl);
            }
          }
        } catch (e) {
          // Skip invalid data
        }
      }
      
      return images;
    }, maxImages);

    console.log(`Found ${imageUrls.length} images from Bing for query: ${query}`);
    return imageUrls.filter(url => url && url.length > 10);

  } catch (error) {
    console.error('Bing Images Puppeteer scraping error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// DuckDuckGo Images scraper (as fallback)
async function scrapeDuckDuckGoImages(query, maxImages = 5) {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${optimizeSearchQuery(query)}&t=h_&iax=images&ia=images`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const images = [];
    
    // Extract image URLs from DuckDuckGo's structure
    $('img').each((i, img) => {
      if (images.length >= maxImages) return false;
      
      const src = $(img).attr('src') || $(img).attr('data-src');
      if (src && src.startsWith('http') && !src.includes('duckduckgo')) {
        images.push(src);
      }
    });

    console.log(`Found ${images.length} images from DuckDuckGo for query: ${query}`);
    return images;

  } catch (error) {
    console.error('DuckDuckGo Images scraping error:', error.message);
    return [];
  }
}

// Validate image URL by checking if it loads properly
async function validateImageUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: { 'User-Agent': getRandomUserAgent() }
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = parseInt(response.headers['content-length'] || '0');
    
    return contentType && 
           contentType.startsWith('image/') && 
           contentLength > 1000 && // At least 1KB
           response.status === 200;
  } catch (error) {
    return false;
  }
}

// Main image scraping function that tries multiple sources
async function scrapeProductImages(query, maxImages = 5) {
  const cacheKey = `images_${query.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check cache first
  const cachedImages = imageCache.get(cacheKey);
  if (cachedImages && cachedImages.length > 0) {
    console.log(`Returning cached images for query: ${query}`);
    return cachedImages;
  }

  let allImages = [];

  try {
    // Try Google Images first (usually best results)
    console.log(`Scraping Google Images for: ${query}`);
    const googleImages = await scrapeGoogleImagesPuppeteer(query, maxImages);
    allImages.push(...googleImages);

    // If we don't have enough images, try Bing
    if (allImages.length < maxImages) {
      console.log(`Scraping Bing Images for: ${query}`);
      const bingImages = await scrapeBingImagesPuppeteer(query, maxImages - allImages.length);
      allImages.push(...bingImages);
    }

    // If still not enough, try DuckDuckGo as fallback
    if (allImages.length < maxImages) {
      console.log(`Scraping DuckDuckGo Images for: ${query}`);
      const duckImages = await scrapeDuckDuckGoImages(query, maxImages - allImages.length);
      allImages.push(...duckImages);
    }

    // Remove duplicates and validate URLs
    const uniqueImages = [...new Set(allImages)];
    const validatedImages = [];

    for (const imageUrl of uniqueImages.slice(0, maxImages)) {
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        validatedImages.push(imageUrl);
      }
      if (validatedImages.length >= maxImages) break;
    }

    console.log(`Final validated images count: ${validatedImages.length} for query: ${query}`);

    // Cache the results
    if (validatedImages.length > 0) {
      imageCache.set(cacheKey, validatedImages);
    }

    return validatedImages;

  } catch (error) {
    console.error('Error in scrapeProductImages:', error);
    return [];
  }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Image scraping server is running' });
});

// Get images for a product
app.post('/api/images/search', checkRateLimit, async (req, res) => {
  try {
    const { query, category, subcategory, maxImages = 5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Enhance query with category and subcategory information
    let enhancedQuery = query.trim();
    if (category) {
      enhancedQuery += ` ${category}`;
    }
    if (subcategory) {
      enhancedQuery += ` ${subcategory}`;
    }

    console.log(`Processing image search request for: ${enhancedQuery}`);

    const images = await scrapeProductImages(enhancedQuery, Math.min(maxImages, 10));

    if (images.length === 0) {
      return res.status(404).json({ 
        error: 'No images found', 
        query: enhancedQuery,
        suggestion: 'Try a different search term or check your internet connection'
      });
    }

    res.json({
      success: true,
      query: enhancedQuery,
      images: images,
      count: images.length,
      cached: imageCache.has(`images_${enhancedQuery.toLowerCase().replace(/\s+/g, '_')}`)
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      query: req.body.query
    });
  }
});

// Get image for specific product with fallback
app.post('/api/images/product', checkRateLimit, async (req, res) => {
  try {
    const { 
      name, 
      category, 
      subcategory, 
      description, 
      brand,
      material,
      features 
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Build comprehensive search query
    let searchTerms = [name];
    
    if (brand) searchTerms.push(brand);
    if (category) searchTerms.push(category);
    if (subcategory) searchTerms.push(subcategory);
    if (material) searchTerms.push(material);
    
    // Add key features if available
    if (features && Array.isArray(features)) {
      searchTerms.push(...features.slice(0, 2)); // Add up to 2 features
    }

    const query = searchTerms.join(' ').trim();
    
    console.log(`Processing product image request for: ${name} -> Query: ${query}`);

    const images = await scrapeProductImages(query, 3); // Get top 3 images

    if (images.length === 0) {
      // Fallback: try with just category if specific product search fails
      const fallbackQuery = category || name;
      const fallbackImages = await scrapeProductImages(fallbackQuery, 1);
      
      if (fallbackImages.length > 0) {
        return res.json({
          success: true,
          query: fallbackQuery,
          image: fallbackImages[0],
          fallback: true,
          message: 'Used category-based fallback image'
        });
      }

      return res.status(404).json({ 
        error: 'No images found for product',
        productName: name,
        query: query
      });
    }

    res.json({
      success: true,
      productName: name,
      query: query,
      image: images[0], // Return the best/first image
      alternatives: images.slice(1), // Additional images as alternatives
      count: images.length
    });

  } catch (error) {
    console.error('Product API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      productName: req.body.name
    });
  }
});

// Clear cache endpoint (for admin use)
app.post('/api/images/clear-cache', (req, res) => {
  try {
    const keys = imageCache.keys();
    imageCache.flushAll();
    res.json({ 
      success: true, 
      message: `Cleared ${keys.length} cached entries`,
      clearedKeys: keys.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache', message: error.message });
  }
});

// Get cache statistics
app.get('/api/images/cache-stats', (req, res) => {
  try {
    const stats = imageCache.getStats();
    const keys = imageCache.keys();
    
    res.json({
      success: true,
      stats: stats,
      totalKeys: keys.length,
      keys: keys.slice(0, 20) // Show first 20 keys as sample
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats', message: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Image scraping server running on port ${PORT}`);
  console.log(`📸 Ready to scrape images from Google, Bing, and DuckDuckGo`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;