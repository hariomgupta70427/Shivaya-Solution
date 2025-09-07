#!/usr/bin/env node

/**
 * Test script for image scraping functionality
 * Run with: node test-scraping.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test products
const testProducts = [
  {
    name: 'Executive Metal Pen',
    category: 'Metal Pens',
    subcategory: 'Executive Series',
    description: 'Premium metal pen with executive finish'
  },
  {
    name: 'Pressure Cooker 5L',
    category: 'Kitchen World',
    subcategory: 'Pressure Cooker',
    description: 'Stainless steel pressure cooker'
  },
  {
    name: 'Plastic Storage Crate',
    category: 'Industrial Plastic Crates',
    subcategory: '400 x 300 Series',
    description: 'Heavy duty plastic storage container'
  }
];

async function testHealthCheck() {
  try {
    console.log('🏥 Testing health check...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testProductImage(product) {
  try {
    console.log(`🔍 Testing image scraping for: ${product.name}`);
    
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE_URL}/images/product`, product, {
      timeout: 30000 // 30 second timeout
    });
    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      console.log(`✅ Success for "${product.name}" (${duration}ms)`);
      console.log(`   Image URL: ${response.data.image.substring(0, 80)}...`);
      console.log(`   Query used: ${response.data.query}`);
      if (response.data.fallback) {
        console.log('   📋 Used fallback image');
      } else {
        console.log('   🎯 Real-time scraped image');
      }
    } else {
      console.log(`❌ Failed for "${product.name}"`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error testing "${product.name}":`, error.message);
    return null;
  }
}

async function testCacheStats() {
  try {
    console.log('📊 Testing cache statistics...');
    const response = await axios.get(`${API_BASE_URL}/images/cache-stats`);
    console.log('✅ Cache stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Cache stats failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Image Scraping Tests\n');
  
  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Server not running. Please start with: npm run server:dev');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test 2: Product Images
  const results = [];
  for (const product of testProducts) {
    const result = await testProductImage(product);
    results.push(result);
    console.log(''); // Empty line for readability
  }
  
  console.log('='.repeat(50));
  
  // Test 3: Cache Stats
  await testCacheStats();
  
  // Summary
  console.log('\n📋 Test Summary:');
  const successful = results.filter(r => r && r.success).length;
  const total = results.length;
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful > 0) {
    console.log('\n🎉 Image scraping is working! You can now:');
    console.log('   1. Start the frontend: npm run dev');
    console.log('   2. View products with real-time images');
    console.log('   3. Check the browser console for scraping logs');
  } else {
    console.log('\n⚠️  No images were scraped. This could be due to:');
    console.log('   1. Network connectivity issues');
    console.log('   2. Search engine blocking (try different queries)');
    console.log('   3. Rate limiting (wait a few minutes)');
    console.log('   4. The system will still work with fallback images');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

// Run the tests
runTests().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});