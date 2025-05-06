import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// Component imports
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import InvoiceHistory from './components/InvoiceHistory';
import CreateInvoice from './components/CreateInvoice';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import Login from './components/Login';

// Auth context
import { AuthProvider, useAuth } from './components/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

// Icons component for the navigation
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  Categories: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  Products: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  Invoices: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  CreateInvoice: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  )
};

// Navigation item component
function NavItem({ to, label, icon, isMobile, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to));
  
  // For action items like logout that don't have a route
  if (onClick) {
    return (
      <button onClick={onClick} className={`${isMobile ? 'nav-item' : ''} action-item`}>
        {isMobile && <div className="icon">{icon}</div>}
        <div className={isMobile ? "label" : ''}>{label}</div>
      </button>
    );
  }
  
  return (
    <Link to={to} className={`${isMobile ? 'nav-item' : ''} ${isActive ? 'active' : ''}`}>
      {isMobile && <div className="icon">{icon}</div>}
      <div className={isMobile ? "label" : ''}>{label}</div>
    </Link>
  );
}

// Protected App content with navigation and routes
function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  
  // For tracking window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update windowWidth on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Check if mobile view
  const isMobile = windowWidth < 768;
  
  // If not authenticated, don't render navigation
  if (!isAuthenticated) {
    return null;
  }
  
  // Navigation routes configuration
  const navRoutes = [
    { path: '/', label: 'Dashboard', icon: <Icons.Dashboard /> },
    { path: '/categories', label: 'Categories', icon: <Icons.Categories /> },
    { path: '/products', label: 'Products', icon: <Icons.Products /> },
    { path: '/invoices', label: 'Invoices', icon: <Icons.Invoices /> },
    { path: '/create-invoice', label: 'New Invoice', icon: <Icons.CreateInvoice /> },
    { path: '/analytics', label: 'Analytics', icon: <Icons.Analytics /> },
    { path: '/settings', label: 'Settings', icon: <Icons.Settings /> }
  ];
  
  // Choose which navigation items to display on mobile (max 5)
  const mobileNavRoutes = [
    navRoutes[0], // Dashboard
    navRoutes[1], // Categories
    navRoutes[2], // Products
    navRoutes[4], // New Invoice
    navRoutes[5], // Analytics
  ];
  
  return (
    <div className="app">
      {/* Desktop header navigation */}
      <header className="desktop-header">
        <nav>
          {navRoutes.map((route) => (
            <NavItem 
              key={route.path} 
              to={route.path} 
              label={route.label} 
              icon={route.icon}
              isMobile={false}
            />
          ))}
          <NavItem
            key="logout"
            label="Logout"
            icon={<Icons.Logout />}
            isMobile={false}
            onClick={logout}
          />
        </nav>
      </header>
      
      {/* Main content */}
      <main className="content page-transition">
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/categories" element={
            <PrivateRoute>
              <CategoryPage />
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <ProductPage />
            </PrivateRoute>
          } />
          <Route path="/invoices" element={
            <PrivateRoute>
              <InvoiceHistory />
            </PrivateRoute>
          } />
          <Route path="/create-invoice" element={
            <PrivateRoute>
              <CreateInvoice />
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <nav className="bottom-navbar">
          {mobileNavRoutes.map((route) => (
            <NavItem 
              key={route.path} 
              to={route.path} 
              label={route.label} 
              icon={route.icon}
              isMobile={true}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

// The main App wrapper with routing and auth
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;