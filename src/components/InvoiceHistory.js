import React, { useState, useEffect } from 'react';
import { getInvoicesByDate } from '../utils/storage';
import './InvoiceHistory.css';

export default function InvoiceHistory() {
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  // Load and filter invoices
  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const invs = await getInvoicesByDate(date);
        setInvoices(invs);
        setFiltered(invs);
        setSelected(null);
        setSearchTerm('');
        setViewMode('list');
      } catch (err) {
        console.error('Error loading invoices:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [date]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(invoices);
    } else {
      setFiltered(
        invoices.filter(inv =>
          String(inv.id).includes(searchTerm.trim())
        )
      );
    }
  }, [searchTerm, invoices]);

  // Handle invoice selection
  const handleSelectInvoice = (invoice) => {
    setSelected(invoice);
    setViewMode('detail');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('en-IN', options);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        {viewMode === 'list' ? (
          <>
            <h1>Invoice History</h1>
            <p className="subheading">View and search past invoices</p>
          </>
        ) : (
          <div className="header-with-back">
            <button 
              className="back-button" 
              onClick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back to List
            </button>
            <h1>Invoice #{selected?.id}</h1>
          </div>
        )}
      </header>

      {viewMode === 'list' && (
        <>
          <div className="filter-controls">
            <div className="date-filter">
              <label htmlFor="invoice-date">Filter by Date</label>
              <input
                id="invoice-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by invoice #"
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

          {isLoading ? (
            <div className="loading-indicator">Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <p className="empty-state-text">No invoices found for this date.</p>
              <p className="empty-state-hint">Try selecting a different date or clearing your search.</p>
            </div>
          ) : (
            <div className="invoice-list">
              <div className="date-indicator">{formatDate(date)}</div>
              
              {filtered.map(invoice => {
                const total = Number(invoice.total || 0).toFixed(2);
                return (
                  <div 
                    key={invoice.id} 
                    className="invoice-card"
                    onClick={() => handleSelectInvoice(invoice)}
                  >
                    <div className="invoice-card-header">
                      <div className="invoice-number">#{invoice.id}</div>
                      <div className="invoice-time">{formatTime(invoice.datetime)}</div>
                    </div>
                    
                    <div className="invoice-card-footer">
                      <div className="invoice-items-count">
                        {invoice.items?.length || 0} {invoice.items?.length === 1 ? 'item' : 'items'}
                      </div>
                      <div className="invoice-total">₹{total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === 'detail' && selected && (
        <div className="invoice-detail-view">
          <div className="invoice-detail-header">
            <div className="invoice-date">
              {formatDate(selected.datetime)} at {formatTime(selected.datetime)}
            </div>
          </div>
          
          <div className="invoice-items-list">
            <h2>Items</h2>
            {selected.items?.length > 0 ? (
              <div className="items-container">
                {selected.items.map((item, index) => {
                  const price = Number(item.price || 0);
                  const qty = Number(item.qty || 0);
                  const itemTotal = price * qty;
                  
                  return (
                    <div key={index} className="invoice-item">
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-meta">
                          {qty} × ₹{price.toFixed(2)}
                        </div>
                      </div>
                      <div className="item-total">₹{itemTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-items">No items in this invoice</div>
            )}
          </div>
          
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(selected.total || 0).toFixed(2)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{Number(selected.total || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="invoice-actions">
            <button className="action-button print">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Invoice
            </button>
            <button className="action-button share">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}