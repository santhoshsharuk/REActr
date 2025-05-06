// src/components/Settings.js

import React, { useState, useEffect } from 'react';
import { saveSettings, getSettings } from '../utils/storage';
import './Settings.css';

export default function Settings() {
  const [form, setForm] = useState({
    store: '',
    address: '',
    phone: '',
    gpayId: '',
    gstEnabled: false,
    logo: '',
  });
  const [initial, setInitial] = useState(null);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('business');

  // Load saved settings once
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        setForm(f => ({ ...f, ...settings }));
        setInitial(settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Validate whenever form changes
  useEffect(() => {
    const errs = {};
    if (!form.store.trim()) errs.store = 'Store name is required';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      errs.phone = 'Enter a 10-digit phone';
    setErrors(errs);
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const hasChanges = () => {
    if (!initial) return false;
    return Object.keys(form).some(k => form[k] !== initial[k]);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!isValid) return;
    
    setIsLoading(true);
    try {
      await Promise.all(
        Object.entries(form).map(([k, v]) =>
          saveSettings({ key: k, value: v })
        )
      );
      setInitial({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="subheading">Configure your business information</p>
      </header>

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          Business Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </button>
        <button 
          className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Logo
        </button>
      </div>

      {isLoading ? (
        <div className="loading-indicator">Loading settings...</div>
      ) : (
        <div className="settings-form">
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <>
              <div className="input-group">
                <label htmlFor="store-name">Store Name</label>
                <input
                  id="store-name"
                  type="text"
                  value={form.store}
                  onChange={e => setForm(f => ({ ...f, store: e.target.value }))}
                  placeholder="Enter your business name"
                />
                {errors.store && <div className="error-message">{errors.store}</div>}
              </div>

              <div className="input-group">
                <label htmlFor="address">Business Address</label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Enter your business address"
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit phone number"
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.gstEnabled}
                    onChange={e => setForm(f => ({ ...f, gstEnabled: e.target.checked }))}
                  />
                  <span>Enable GST for Invoices</span>
                </label>
              </div>
            </>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <>
              <div className="input-group">
                <label htmlFor="gpay-id">GPay ID (UPI)</label>
                <input
                  id="gpay-id"
                  type="text"
                  value={form.gpayId}
                  onChange={e => setForm(f => ({ ...f, gpayId: e.target.value }))}
                  placeholder="yourname@upi"
                />
              </div>
              
              <div className="info-card">
                <div className="info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div className="info-content">
                  Your UPI ID will be displayed on invoices so customers can pay you easily.
                </div>
              </div>
            </>
          )}

          {/* Logo Tab */}
          {activeTab === 'appearance' && (
            <>
              <div className="logo-section">
                <label>Business Logo</label>
                
                <div className="logo-container">
                  {form.logo ? (
                    <div className="logo-preview-container">
                      <img src={form.logo} alt="Business logo preview" className="logo-preview" />
                      <button 
                        className="remove-logo-button"
                        onClick={() => setForm(f => ({ ...f, logo: '' }))}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="logo-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>No logo uploaded</span>
                    </div>
                  )}
                  
                  <div className="upload-button-container">
                    <label htmlFor="logo-upload" className="upload-button">
                      {form.logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFile}
                      className="hidden-input" 
                    />
                  </div>
                </div>
                
                <div className="logo-tips">
                  <p>Tips: Use a square image of at least 200x200 pixels for best results. PNG format with transparent background is recommended.</p>
                </div>
              </div>
            </>
          )}

          <div className="action-bar">
            <button
              className={`save-button ${hasChanges() && isValid ? 'active' : 'disabled'}`}
              onClick={save}
              disabled={!hasChanges() || !isValid}
            >
              Save Changes
            </button>
            {saved && <div className="success-message">Settings saved successfully!</div>}
          </div>
        </div>
      )}
    </div>
  );
}