// Updated App.js with improved mobile-first navigation and UI

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  Navigate,
  useNavigate 
} from 'react-router-dom';

// Component imports
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import InvoiceHistory from './components/InvoiceHistory';
import CreateInvoice from './components/CreateInvoice';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

import './App.css';

// Icons component for the navigation
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  Categories: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  ),
  Products: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  Invoices: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  CreateInvoice: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="close-icon">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  )
};

// Mobile Header Component
function MobileHeader({ title, showBackButton, hasMenu, onMenuToggle }) {
  const navigate = useNavigate();
  
  return (
    <div className="mobile-header">
      <div className="header-left">
        {showBackButton && (
          <button className="header-back-button" onClick={() => navigate(-1)}>
            <Icons.Back />
          </button>
        )}
      </div>
      
      <h1 className="header-title">{title}</h1>
      
      <div className="header-right">
        {hasMenu && (
          <button className="header-menu-button" onClick={onMenuToggle}>
            <Icons.Menu />
          </button>
        )}
      </div>
    </div>
  );
}

// Mobile Drawer Menu Component
function MobileDrawer({ isOpen, onClose, children }) {
  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose}></div>}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <button className="drawer-close" onClick={onClose}>
            <Icons.Close />
          </button>
          <h2 className="drawer-title">Menu</h2>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}

// Navigation item component
function NavItem({ to, label, icon, isMobile, onClick, onNavigate }) {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to));
  
  // For action items like logout that don't have a route
  if (onClick) {
    return (
      <button onClick={onClick} className={`nav-item ${isMobile ? 'mobile' : ''}`}>
        <div className="nav-icon-wrapper">{icon}</div>
        <div className="nav-label">{label}</div>
      </button>
    );
  }
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };
  
  return (
    <Link to={to} className={`nav-item ${isMobile ? 'mobile' : ''} ${isActive ? 'active' : ''}`} onClick={handleClick}>
      <div className="nav-icon-wrapper">{icon}</div>
      <div className="nav-label">{label}</div>
    </Link>
  );
}

// Page titles configuration
const pageTitles = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/products': 'Products',
  '/invoices': 'Invoice History',
  '/create-invoice': 'Create Invoice',
  '/analytics': 'Analytics',
  '/settings': 'Settings'
};

// Protected App content with navigation and routes
function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const [currentTitle, setCurrentTitle] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle responsive changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Set the page title based on the current route
  useEffect(() => {
    // Find the most specific matching path
    const path = Object.keys(pageTitles)
      .filter(path => location.pathname.startsWith(path))
      .sort((a, b) => b.length - a.length)[0];
    
    setCurrentTitle(path ? pageTitles[path] : 'App');
    
    // Close the drawer when route changes
    setDrawerOpen(false);
  }, [location]);
  
  // Example: Set isAuthenticated to true for now (replace with your actual auth logic later)
  const isAuthenticated = true;

  // If not authenticated, don't render navigation
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
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

  return (
    <div className="app">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader 
          title={currentTitle} 
          showBackButton={location.pathname !== '/'} 
          hasMenu={true}
          onMenuToggle={() => setDrawerOpen(!drawerOpen)}
        />
      )}
      
      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-nav">
          {navRoutes.map((route) => (
            <NavItem 
              key={route.path} 
              to={route.path} 
              label={route.label} 
              icon={route.icon}
              isMobile={true}
              onNavigate={() => setDrawerOpen(false)}
            />
          ))}
          <NavItem
            key="logout"
            label="Logout"
            icon={<Icons.Logout />}
            isMobile={true}
            onClick={() => console.log("Logout clicked")}
          />
        </div>
      </MobileDrawer>
      
      {/* Desktop header navigation */}
      {!isMobile && (
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
              onClick={() => console.log("Logout clicked")}
            />
          </nav>
        </header>
      )}
      
      {/* Main content */}
      <main className={`content page-transition ${isMobile ? 'has-mobile-header' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/invoices" element={<InvoiceHistory />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="bottom-navbar">
          {navRoutes.slice(0, 5).map((route) => (
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;