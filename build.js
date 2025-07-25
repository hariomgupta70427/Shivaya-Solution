#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure public directories exist
console.log('Creating directories...');
if (!fs.existsSync('public/product-catalog')) {
  fs.mkdirSync('public/product-catalog', { recursive: true });
}

if (!fs.existsSync('public/data')) {
  fs.mkdirSync('public/data', { recursive: true });
}

// Copy product catalog files
console.log('Copying product catalog files...');
const productCatalogFiles = [
  'Dyna Metal Pen Catalog.json',
  'HouseHold Products.json',
  'OJAS Kitchen World Catalogue Products List .json',
  'Saran Enterprises catalog.json',
  'other.json',
  'videos.json',
  'structured-catalog.json'
];

productCatalogFiles.forEach(file => {
  const sourcePath = path.join(__dirname, 'src', 'product-catalog', file);
  const destPath = path.join(__dirname, 'public', 'product-catalog', file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to public/product-catalog/`);
  } else {
    console.warn(`Warning: Source file ${sourcePath} not found`);
  }
});

// Copy data files
console.log('Copying data files...');
const dataFiles = [
  'products1.json',
  'products2.json',
  'structured-catalog.json'
];

dataFiles.forEach(file => {
  const sourcePath = path.join(__dirname, 'public', 'data', file);
  const destPath = path.join(__dirname, 'dist', 'data', file);
  
  // Skip this step during prebuild since dist doesn't exist yet
  if (process.argv.includes('--postbuild')) {
    if (fs.existsSync(sourcePath)) {
      // Create dist/data directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, 'dist', 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'dist', 'data'), { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to dist/data/`);
    } else {
      console.warn(`Warning: Source file ${sourcePath} not found`);
    }
  }
});

// Copy product catalog files to dist
console.log('Copying product catalog files to dist...');
// Skip this step during prebuild since dist doesn't exist yet
if (process.argv.includes('--postbuild')) {
  if (!fs.existsSync(path.join(__dirname, 'dist', 'product-catalog'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'product-catalog'), { recursive: true });
  }

  productCatalogFiles.forEach(file => {
    const sourcePath = path.join(__dirname, 'public', 'product-catalog', file);
    const destPath = path.join(__dirname, 'dist', 'product-catalog', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to dist/product-catalog/`);
    } else {
      console.warn(`Warning: Source file ${sourcePath} not found`);
    }
  });
}

console.log('Build script completed successfully!'); 