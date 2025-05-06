import React, { useState, useEffect } from 'react';
import {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory
} from '../utils/storage';
import './CategoryPage.css';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Unable to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addCategory({ name: name.trim() });
      setName('');
      loadCategories();
    } catch (err) {
      console.error('Failed to add category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setShowConfirmDelete(null);
      loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleEdit = (id, currentName) => {
    setEditMode(id);
    setEditName(currentName);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    
    try {
      await updateCategory({ id, name: editName.trim() });
      setEditMode(null);
      setEditName('');
      loadCategories();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Categories</h1>
        <p className="subheading">Manage product categories</p>
      </header>

      <div className="card add-category-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="form-input"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter category name"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className={`action-button primary ${isSubmitting ? 'disabled' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>

      {isLoading ? (
        <div className="loading-indicator">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
            </svg>
          </div>
          <p className="empty-state-text">No categories yet. Add your first category above.</p>
        </div>
      ) : (
        <div className="categories-list-container card">
          <ul className="categories-list">
            {categories.map(category => (
              <li key={category.id} className="category-item">
                {editMode === category.id ? (
                  <div className="category-edit-mode">
                    <input
                      className="category-edit-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div className="category-actions">
                      <button
                        className="icon-button save"
                        onClick={() => handleSaveEdit(category.id)}
                        aria-label="Save changes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button
                        className="icon-button cancel"
                        onClick={handleCancelEdit}
                        aria-label="Cancel editing"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : showConfirmDelete === category.id ? (
                  <div className="delete-confirmation">
                    <p>Delete "{category.name}"?</p>
                    <div className="confirmation-actions">
                      <button 
                        className="confirm-button delete"
                        onClick={() => handleDelete(category.id)}
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
                    <span className="category-name">{category.name}</span>
                    <div className="category-actions">
                      <button
                        className="icon-button edit"
                        onClick={() => handleEdit(category.id, category.name)}
                        aria-label="Edit category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="icon-button delete"
                        onClick={() => setShowConfirmDelete(category.id)}
                        aria-label="Delete category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}