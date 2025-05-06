import React, { useState, useEffect, useRef } from 'react';
import {
  getAllCategories,
  getAllProducts,
  addInvoice,
  getSettings
} from '../utils/storage';
import { generateQRCode } from '../utils/qrGenerator';
import './CreateInvoice.css';

export default function CreateInvoice() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState({});
  const [lastInvoice, setLastInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('products'); // 'products', 'cart', 'receipt'
  
  const printRef = useRef();
  const cartTotal = cart.reduce((sum, p) => sum + (Number(p.price) * p.qty), 0);

  // Load categories, products, and settings once
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, productsData, settingsData] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          getSettings()
        ]);
        
        setCategories(categoriesData);
        setProducts(productsData);
        setSettings(settingsData);
      } catch (err) {
        console.error('Error loading invoice data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Add item or increment its qty
  const addToCart = (product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentCart.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      
      return [...currentCart, { ...product, qty: 1 }];
    });
    
    // Show success feedback (optional)
    if (cart.length === 0) {
      setViewMode('cart');
    }
  };

  // Qty controls
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(currentCart => currentCart.filter(item => item.id !== id));
    } else {
      setCart(currentCart => 
        currentCart.map(item => 
          item.id === id ? { ...item, qty: newQty } : item
        )
      );
    }
  };

  // Save invoice and generate UPI QR
  const saveInvoice = async () => {
    if (cart.length === 0) return;
    
    setIsSaving(true);
    
    try {
      const now = new Date();
      const items = cart.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty: product.qty
      }));
      
      const total = items.reduce((sum, product) => sum + (product.price * product.qty), 0);
      
      const invoice = {
        date: now.toISOString().split('T')[0],
        datetime: now.toISOString(),
        items,
        total
      };
      
      const id = await addInvoice(invoice);
      
      // Build UPI URI with amount
      const upi = new URL('upi://pay');
      upi.searchParams.set('pa', settings.gpayId || '');
      upi.searchParams.set('pn', settings.store || '');
      upi.searchParams.set('am', total.toFixed(2));
      upi.searchParams.set('cu', 'INR');
      
      const qr = await generateQRCode(upi.toString());
      setLastInvoice({ id, qr, ...invoice });
      setCart([]);
      setViewMode('receipt');
    } catch (err) {
      console.error('Error saving invoice:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products by category and search term
  const getFilteredProducts = () => {
    let filtered = selectedCat
      ? products.filter(p => p.categoryId === Number(selectedCat))
      : products;
      
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const handlePrint = () => window.print();
  
  const handleBackButton = () => {
    if (viewMode === 'receipt') {
      setLastInvoice(null);
      setViewMode('products');
    } else if (viewMode === 'cart') {
      setViewMode('products');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Create Invoice</h1>
          
          {viewMode !== 'products' && (
            <button className="back-button" onClick={handleBackButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back
            </button>
          )}
        </div>
        
        {viewMode === 'products' && (
          <div className="cart-preview" onClick={() => setViewMode('cart')}>
            <div className="cart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </div>
            {cart.length > 0 && (
              <div className="cart-total">
                ₹{cartTotal.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="loading-indicator">Loading invoice data...</div>
      ) : (
        <>
          {viewMode === 'products' && (
            <>
              {/* Product selection view */}
              <div className="invoice-options">
                {/* Category filter */}
                <div className="category-selector">
                  <select 
                    value={selectedCat} 
                    onChange={e => setSelectedCat(e.target.value)}
                    className="category-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Product search */}
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search" 
                      onClick={() => setSearchTerm('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Product grid */}
              <div className="products-grid">
                {getFilteredProducts().map(product => (
                  <div 
                    key={product.id} 
                    className="product-card" 
                    onClick={() => addToCart(product)}
                  >
                    <div className="product-details">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">₹{Number(product.price).toFixed(2)}</div>
                      
                      {cart.find(item => item.id === product.id) && (
                        <div className="in-cart-indicator">
                          <span className="qty-badge">
                            {cart.find(item => item.id === product.id).qty}
                          </span>
                          <span>in cart</span>
                        </div>
                      )}
                    </div>
                    <div className="add-to-cart">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                  </div>
                ))}
                
                {getFilteredProducts().length === 0 && (
                  <div className="empty-products">
                    <p>No products found. Try a different category or search term.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'cart' && (
            <div className="cart-view">
              <h2>Cart Items</h2>
              
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </div>
                  <p>Your cart is empty</p>
                  <button 
                    className="primary-button" 
                    onClick={() => setViewMode('products')}
                  >
                    Add Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item, index) => {
                      const price = Number(item.price);
                      const itemTotal = price * item.qty;
                      
                      return (
                        <div key={index} className="cart-item">
                          <div className="item-details">
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">₹{price.toFixed(2)}</div>
                          </div>
                          
                          <div className="item-actions">
                            <div className="quantity-control">
                              <button 
                                className="qty-btn decrease" 
                                onClick={() => updateQuantity(item.id, item.qty - 1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              
                              <span className="qty-value">{item.qty}</span>
                              
                              <button 
                                className="qty-btn increase" 
                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                            
                            <div className="item-total">₹{itemTotal.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {settings.gstEnabled && (
                      <div className="summary-row">
                        <span>GST (18%)</span>
                        <span>₹{(cartTotal * 0.18).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{(cartTotal * (settings.gstEnabled ? 1.18 : 1)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="cart-actions">
                    <button 
                      className="secondary-button" 
                      onClick={() => setViewMode('products')}
                    >
                      Add More
                    </button>
                    <button 
                      className="primary-button" 
                      onClick={saveInvoice}
                      disabled={isSaving || cart.length === 0}
                    >
                      {isSaving ? 'Saving...' : 'Save & Generate Invoice'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {viewMode === 'receipt' && lastInvoice && (
            <div className="receipt-container">
              <div className="invoice-preview receipt" ref={printRef}>
                {/* Logo */}
                {settings.logo && (
                  <img src={settings.logo} alt="Store Logo" className="invoice-logo" />
                )}
                <h3>Invoice #{lastInvoice.id}</h3>
                <p>
                  <strong>{settings.store}</strong><br />
                  {settings.address}<br />
                  Phone: {settings.phone}
                </p>
                <p>Date: {new Date(lastInvoice.datetime).toLocaleString('en-IN')}</p>

                <table className="invoice-table">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {lastInvoice.items.map((p, idx) => {
                      const price = Number(p.price);
                      return (
                        <tr key={idx}>
                          <td>{p.name}</td>
                          <td>{p.qty}</td>
                          <td>₹{price.toFixed(2)}</td>
                          <td>₹{(price * p.qty).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p><strong>Subtotal:</strong> ₹{lastInvoice.total.toFixed(2)}</p>
                {settings.gstEnabled && (
                  <p><strong>GST (18%):</strong> ₹{(lastInvoice.total * 0.18).toFixed(2)}</p>
                )}
                <p><strong>Total:</strong> ₹{(lastInvoice.total * (settings.gstEnabled ? 1.18 : 1)).toFixed(2)}</p>

                {lastInvoice.qr && (
                  <img src={lastInvoice.qr} alt="GPay QR" className="qr-code" />
                )}
              </div>
              
              <div className="receipt-actions">
                <button className="primary-button" onClick={handlePrint}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Print Invoice
                </button>
                <button className="secondary-button" onClick={() => setViewMode('products')}>
                  Create New Invoice
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}