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
        <h1>Dashboard</h1>
        <p className="date-display">{formattedDate}</p>
      </header>
      
      {isLoading ? (
        <div className="loading-indicator">Loading dashboard data...</div>
      ) : (
        <>
          {/* Sales Summary Card */}
          <div className="summary-card">
            <div className="summary-content">
              <div className="summary-label">Today's Sales</div>
              <div className="summary-value">₹{dashboardData.todaySales.toFixed(2)}</div>
            </div>
            <div className="summary-icon">
              
              <span className="rupee-symbol">₹</span>
            </div>

          </div>
          
          {/* Stats Summary */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value">{dashboardData.totalInvoices}</div>
            </div>
          </div>
          
          {/* Quick Actions for Mobile */}
          <div className="action-buttons">
            <Link to="/create-invoice" className="action-button primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>New Invoice</span>
            </Link>
            <Link to="/invoices" className="action-button secondary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>View Invoices</span>
            </Link>
          </div>
          
          {/* Recent Invoices Section */}
          <section className="recent-invoices">
            <div className="section-header">
              <h2>Recent Invoices</h2>
              <Link to="/invoices" className="view-all-button">View All</Link>
            </div>
            
            {dashboardData.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
              <div className="invoice-list">
                {dashboardData.recentInvoices.map((invoice, index) => (
                  <div className="invoice-item" key={index}>
                    <div className="invoice-details">
                      <div className="customer-name">{invoice.customerName || 'Customer'}</div>
                      <div className="invoice-amount">₹{Number(invoice.total || 0).toFixed(2)}</div>
                    </div>
                    <div className="invoice-status">
                      <span className="status-badge paid">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No invoices created today</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}