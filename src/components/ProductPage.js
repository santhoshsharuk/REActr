import React, { useState, useEffect } from 'react';
import {
  getAllCategories,
  getProductsByCategory,
  getAllProducts,
  addProduct,
  deleteProduct,
  updateProduct
} from '../utils/storage';
import './ProductPage.css';

export default function ProductPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load categories once
  useEffect(() => {
    loadCategories();
  }, []);

  // Reload products whenever selectedCategoryId changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategoryId]);

  // Load all categories
  const loadCategories = async () => {
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch products based on current selectedCategoryId
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const productsList = selectedCategoryId
        ? await getProductsByCategory(selectedCategoryId)
        : await getAllProducts();
      setProducts(productsList);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category filter selection
  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id === selectedCategoryId ? null : id);
  };

  // Validate form fields
  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Product name is required.');
      return false;
    }
    
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError('Enter a valid price (must be a positive number).');
      return false;
    }
    
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a valid stock amount (must be a non-negative number).');
      return false;
    }
    
    setError('');
    return true;
  };

  // Clear form inputs and reset editing state
  const clearForm = () => {
    setForm({ name: '', price: '', stock: '' });
    setEditingId(null);
    setError('');
  };

  // Add new or update existing product
  const handleAddOrUpdate = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: selectedCategoryId
      };
      
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
        setEditingId(null);
      } else {
        await addProduct(payload);
      }
      
      clearForm();
      loadProducts();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a product
  const startEdit = (product) => {
    setShowForm(true);
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock)
    });
    setError('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing or adding
  const cancelForm = () => {
    clearForm();
    setShowForm(false);
  };

  // Delete product and refresh
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setShowConfirmDelete(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="page-container">
      {/* Category Filter Pills */}
      <div className="category-filter">
        <div className="scroll-container">
          <button
            className={`category-pill ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={() => handleCategoryClick(null)}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-pill ${category.id === selectedCategoryId ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Form Button */}
      {!showForm ? (
        <button 
          className="add-button" 
          onClick={() => setShowForm(true)}
          aria-label="Add product"
        >
          <span className="add-button-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          <span className="add-button-text">Add Product</span>
        </button>
      ) : (
        <div className="product-form card">
          <div className="form-header">
            <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <button 
              className="close-button" 
              onClick={cancelForm}
              aria-label="Close form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="product-name">Product Name</label>
            <input
              id="product-name"
              type="text"
              placeholder="Enter product name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="product-price">Price (₹)</label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                inputMode="decimal"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="product-stock">Stock</label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                inputMode="numeric"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-actions">
            <button 
              className="button button-secondary" 
              onClick={cancelForm}
              type="button"
            >
              Cancel
            </button>
            <button 
              className={`button button-primary ${isSubmitting ? 'button-loading' : ''}`}
              onClick={handleAddOrUpdate}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner small"></span>
                  <span>{editingId ? 'Saving...' : 'Adding...'}</span>
                </>
              ) : (
                editingId ? 'Save Changes' : 'Add Product'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Product List */}
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <p className="empty-state-text">
            {selectedCategoryId ? 'No products in this category.' : 'No products found.'}
          </p>
          <button 
            className="button button-primary" 
            onClick={() => setShowForm(true)}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              {showConfirmDelete === product.id ? (
                <div className="delete-confirmation">
                  <p>Delete "{product.name}"?</p>
                  <div className="confirmation-actions">
                    <button 
                      className="confirm-button delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="confirm-button cancel"
                      onClick={() => setShowConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="category-tag">{getCategoryName(product.categoryId)}</span>
                    <div className="product-meta">
                      <div className="price">₹{Number(product.price).toFixed(2)}</div>
                      <div className="stock">Stock: {product.stock}</div>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="icon-button edit" 
                      onClick={() => startEdit(product)}
                      aria-label="Edit product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="icon-button delete" 
                      onClick={() => setShowConfirmDelete(product.id)}
                      aria-label="Delete product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Floating Add Button for Mobile */}
      {!showForm && isMobile && (
        <button 
          className="floating-add-button" 
          onClick={() => setShowForm(true)}
          aria-label="Add product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}
    </div>
  );
}