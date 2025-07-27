import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeStorage, getProducts } from './services/productService';
import { convertProductCatalogToCSV } from './utils/csvConverter';
import toast, { Toaster } from 'react-hot-toast';

// Initialize storage and convert JSON catalog to CSV
const initApp = async () => {
  try {
    console.log('Initializing storage...');
    await initializeStorage();
    console.log('Storage initialized successfully');
    
    // Test fetching products to ensure everything is working
    console.log('Testing product retrieval...');
    const products = await getProducts();
    console.log(`Retrieved ${products.length} products`);
    
    if (products.length === 0) {
      console.log('No products found, attempting to import from JSON catalog...');
      const csvData = await convertProductCatalogToCSV();
      if (csvData && csvData.length > 0) {
        console.log('CSV data generated, length:', csvData.length);
      } else {
        console.warn('Failed to generate CSV data from JSON catalog');
      }
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    toast.error('Failed to initialize the application. Please check the console for details.');
  }
};

// Create root before running initialization
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Render the app with a loading state first
root.render(
  <StrictMode>
    <Toaster position="top-right" />
    <App />
  </StrictMode>
);

// Run initialization in the background
initApp().catch(error => {
  console.error('Unhandled error during initialization:', error);
  toast.error('Failed to initialize the application. Please check the console for details.');
});
