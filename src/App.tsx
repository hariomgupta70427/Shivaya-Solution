import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { InquiryProvider } from './contexts/InquiryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Categories from './pages/admin/Categories';
import AddCategory from './pages/admin/AddCategory';
import EditCategory from './pages/admin/EditCategory';
import Analytics from './pages/admin/Analytics';

// Protected route component that checks for authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isCheckingMode, setIsCheckingMode] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const checkMode = () => {
      console.log('Checking demo mode...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || 
          !supabaseKey || supabaseKey === 'placeholder_key') {
        console.log('Demo mode enabled');
        setIsDemoMode(true);
      } else {
        console.log('Demo mode disabled');
      }
      setIsCheckingMode(false);
    };
    
    checkMode();
  }, []);
  
  // If loading timed out, show an error message and allow access in demo mode
  if (loadingTimeout && (loading || isCheckingMode)) {
    console.log('Loading timed out, entering demo mode');
    return <>{children}</>;
  }
  
  // If still loading, show loading spinner
  if (loading || isCheckingMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark-bg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-warm-orange mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {loading ? 'Checking authentication...' : 'Initializing application...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Allow access in demo mode or if user is authenticated
  if (isDemoMode || user) {
    return <>{children}</>;
  }
  
  // Otherwise redirect to login
  return <Navigate to="/admin/login" replace />;
};

function AppContent() {
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
          <Routes>
            {/* Admin routes - protected */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/admin/categories/new" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
            <Route path="/admin/categories/edit/:id" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            {/* Public routes */}
            <Route path="/" element={<><Header /><Home /><Footer /></>} />
            <Route path="/about" element={<><Header /><About /><Footer /></>} />
            <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
            <Route path="/products" element={<><Header /><Products /><Footer /></>} />
            <Route path="/products/:categoryId" element={<><Header /><Products /><Footer /></>} />
            {/* Fallback route for 404 errors */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster position="top-right" />
        </div>
      </Router>
    </InquiryProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;