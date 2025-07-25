import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { InquiryProvider } from './contexts/InquiryContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  const { theme } = useTheme();
  
  // Apply theme to document element to ensure dark mode works properly
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <InquiryProvider>
      <Router>
        <div className="min-h-screen bg-brand-cream dark:bg-brand-dark-bg transition-colors duration-300">
          <Header />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:categorySlug" element={<Products />} />
              <Route path="/products/:categorySlug/:subcategorySlug" element={<Products />} />
              <Route path="/products/:categorySlug/:subcategorySlug/:productSlug" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Fallback route for 404 errors */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </InquiryProvider>
  );
}

export default App;