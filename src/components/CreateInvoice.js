import React, { useState, useEffect, useRef } from 'react';
import {
  getAllCategories,
  getAllProducts,
  addInvoice,
  getSettings
} from '../utils/storage';
import { generateQRCode } from '../utils/qrGenerator';
import BluetoothPrinter from '../utils/BluetoothPrinter'; // Import the Bluetooth printer utility
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState(''); // For status messages
  
  const printRef = useRef();
  const cartTotal = cart.reduce((sum, p) => sum + (Number(p.price) * p.qty), 0);
  const searchInputRef = useRef(null);

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
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
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
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
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

  // Standard browser print
  const handleRegularPrint = () => window.print();
  
  // Handle printing via Bluetooth
  const handleBluetoothPrint = async () => {
    if (!lastInvoice) return;
    
    // Set status to printing
    setIsPrinting(true);
    setPrintStatus('Connecting to printer...');
    
    try {
      // Check if Bluetooth is supported
      if (!BluetoothPrinter.isSupported()) {
        setPrintStatus('Bluetooth not supported. Using standard print...');
        setTimeout(() => {
          handleRegularPrint();
          setIsPrinting(false);
          setPrintStatus('');
        }, 1500);
        return;
      }
      
      // Connect to Bluetooth printer
      await BluetoothPrinter.connect();
      setPrintStatus('Printer connected! Printing...');
      
      // Format receipt data
      const receiptData = {
        storeName: settings.store || 'My Store',
        address: settings.address || '',
        phone: settings.phone || '',
        invoiceId: lastInvoice.id,
        date: new Date(lastInvoice.datetime).toLocaleString('en-IN'),
        items: lastInvoice.items,
        subtotal: lastInvoice.total,
        gst: settings.gstEnabled ? lastInvoice.total * 0.18 : null,
        total: lastInvoice.total * (settings.gstEnabled ? 1.18 : 1),
        logo: settings.logo
      };
      
      // Print receipt
      await BluetoothPrinter.printReceipt(receiptData);
      
      // Update status
      setPrintStatus('Printing complete!');
      setTimeout(() => {
        setIsPrinting(false);
        setPrintStatus('');
      }, 2000);
      
    } catch (error) {
      console.error('Bluetooth printing error:', error);
      
      // Show error and fallback to standard print
      setPrintStatus(`${error.message}. Falling back to standard print...`);
      setTimeout(() => {
        handleRegularPrint();
        setIsPrinting(false);
        setPrintStatus('');
      }, 2000);
    }
  };
  
  // Navigate back based on current view
  const navigateBack = () => {
    if (viewMode === 'receipt') {
      setLastInvoice(null);
      setViewMode('products');
    } else if (viewMode === 'cart') {
      setViewMode('products');
    }
  };

  // Focus search input when shown
  useEffect(() => {
    if (viewMode === 'products' && searchInputRef.current) {
      // Slight delay to ensure DOM is ready
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [viewMode]);

  // Share invoice
  const shareInvoice = async () => {
    if (!lastInvoice) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice #${lastInvoice.id}`,
          text: `Invoice #${lastInvoice.id} - Total: ₹${Number(lastInvoice.total || 0).toFixed(2)}`,
        });
      } else {
        alert('Sharing is not supported on this device');
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  return (
    <div className="invoice-container">
      {/* Main Content Area */}
      <div className="invoice-content">
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
                  ref={searchInputRef}
                />
                {searchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <>
                {/* Product grid */}
                <div className="products-grid">
                  {getFilteredProducts().length > 0 ? (
                    getFilteredProducts().map(product => (
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
                    ))
                  ) : (
                    <div className="empty-products">
                      <p>No products found. Try a different category or search term.</p>
                    </div>
                  )}
                </div>
              </>
            )}
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
                  className="button button-primary" 
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
                              aria-label="Decrease quantity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                            
                            <span className="qty-value">{item.qty}</span>
                            
                            <button 
                              className="qty-btn increase" 
                              onClick={() => updateQuantity(item.id, item.qty + 1)}
                              aria-label="Increase quantity"
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
                    className="button button-secondary" 
                    onClick={() => navigateBack()}
                  >
                    Add More
                  </button>
                  <button 
                    className="button button-primary" 
                    onClick={saveInvoice}
                    disabled={isSaving || cart.length === 0}
                  >
                    {isSaving ? (
                      <>
                        <span className="loading-spinner small"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save & Generate Invoice'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'receipt' && lastInvoice && (
          <div className="receipt-container">
            {isPrinting && (
              <div className="print-status-overlay">
                <div className="print-status-content">
                  <div className="spinner"></div>
                  <p>{printStatus}</p>
                </div>
              </div>
            )}
            
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
              <button 
                className="receipt-button print"
                onClick={handleBluetoothPrint}
                disabled={isPrinting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Print</span>
              </button>
              
              <button 
                className="receipt-button share"
                onClick={shareInvoice}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>
              
              <button 
                className="receipt-button new"
                onClick={() => navigateBack()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Fixed Cart Preview */}
      {viewMode === 'products' && cart.length > 0 && (
        <div 
          className="fixed-cart-preview" 
          onClick={() => setViewMode('cart')}
        >
          <div className="preview-content">
            <div className="cart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-badge">{cart.length}</span>
            </div>
            <div className="preview-details">
              <span className="items-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
              <span className="cart-total">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="view-cart">
              <span>View Cart</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}