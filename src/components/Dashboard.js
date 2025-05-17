import React, { useState, useEffect } from 'react';
import { getInvoicesByDate, getDashboardStats } from '../utils/storage';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    recentInvoices: [],
    totalInvoices: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get today's date in YYYY-MM-DD format
        const dateKey = new Date().toISOString().split('T')[0];
        
        // If getDashboardStats exists, use it for optimized data fetching
        if (typeof getDashboardStats === 'function') {
          const stats = await getDashboardStats();
          setDashboardData(stats);
        } else {
          // Fallback to original implementation
          const todayInvoices = await getInvoicesByDate(dateKey);
          const todaySales = todayInvoices.reduce(
            (acc, i) => acc + Number(i.total || 0),
            0
          );
          setDashboardData(prevData => ({
            ...prevData,
            todaySales,
            recentInvoices: todayInvoices.slice(0, 3)
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const now = new Date();
  const formattedDate = now.toLocaleString('en-IN');

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="date-display">{formattedDate}</p>
        </div>
        <div className="header-actions">
          <Link to="/create-invoice" className="header-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="sr-only">New Invoice</span>
          </Link>
        </div>
      </header>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Key Stats Summary */}
          <div className="stats-overview">
            <div className="stat-card primary">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Today's Sales</h3>
                <p className="stat-value primary-value">₹{dashboardData.todaySales.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Total Invoices</h3>
                <p className="stat-value secondary-value">{dashboardData.totalInvoices}</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-grid">
              <Link to="/create-invoice" className="action-card primary">
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <span className="action-label">Create New Invoice</span>
              </Link>
              
              <Link to="/invoices" className="action-card secondary">
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="8" y1="8" x2="16" y2="8"></line>
                    <line x1="8" y1="16" x2="12" y2="16"></line>
                  </svg>
                </div>
                <span className="action-label">View All Invoices</span>
              </Link>
              
              <Link to="/customers" className="action-card tertiary">
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span className="action-label">Manage Customers</span>
              </Link>
              
              <Link to="/reports" className="action-card quaternary">
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                  </svg>
                </div>
                <span className="action-label">View Reports</span>
              </Link>
            </div>
          </div>
          
          {/* Recent Invoices Section */}
          <section className="recent-invoices-section">
            <div className="section-header">
              <h2 className="section-title">Recent Invoices</h2>
              <Link to="/invoices" className="view-all-link">
                <span>View All</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
            
            {dashboardData.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
              <div className="invoice-list">
                {dashboardData.recentInvoices.map((invoice, index) => (
                  <div className="invoice-card" key={index}>
                    <div className="invoice-content">
                      <div className="invoice-customer">
                        <div className="customer-initial">
                          {(invoice.customerName || 'Customer').charAt(0)}
                        </div>
                        <div className="customer-details">
                          <h3 className="customer-name">{invoice.customerName || 'Customer'}</h3>
                          <p className="invoice-id">INV-{invoice.id || '000'}</p>
                        </div>
                      </div>
                      <div className="invoice-meta">
                        <div className="invoice-amount">₹{Number(invoice.total || 0).toFixed(2)}</div>
                        <div className="invoice-status">
                          <span className="status-indicator paid"></span>
                          <span className="status-text">Paid</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/invoice/${invoice.id}`} className="invoice-link">
                      <span className="sr-only">View invoice details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
                <p className="empty-message">No invoices created today</p>
                <Link to="/create-invoice" className="empty-action">Create Invoice</Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}