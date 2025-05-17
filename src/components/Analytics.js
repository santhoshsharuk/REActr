import React, { useState, useEffect, useCallback } from 'react';
import { getAllInvoices, getAllProducts } from '../utils/storage';
import './Analytics.css';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalInvoices: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByDay: [],
    productCategoryBreakdown: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter invoices based on selected time range
  const filterInvoicesByTimeRange = useCallback((invoices, range) => {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    return invoices.filter(invoice => new Date(invoice.datetime) >= startDate);
  }, []);

  // Generate array of days based on time range
  const getDaysArray = useCallback((range) => {
    const result = [];
    const now = new Date();
    let days = 0;
    
    switch (range) {
      case 'today':
        return [new Date(now.setHours(0, 0, 0, 0))];
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        // For year, we'll return months instead of days
        const monthsArray = [];
        for (let i = 0; i < 12; i++) {
          const month = new Date(now.getFullYear(), i, 1);
          monthsArray.push(month);
        }
        return monthsArray;
      default:
        days = 7;
    }
    
    for (let i = 0; i < days; i++) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      result.unshift(day);
    }
    
    return result;
  }, []);

  // Calculate sales by day for the chart
  const calculateSalesByDay = useCallback((invoices, range) => {
    const salesMap = {};
    const dateFormat = { weekday: 'short', month: 'short', day: 'numeric' };
    
    // Initialize days based on range
    const days = getDaysArray(range);
    days.forEach(day => {
      const dateKey = day.toLocaleDateString('en-IN', dateFormat);
      salesMap[dateKey] = 0;
    });
    
    // Aggregate sales by day
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.datetime);
      const dateKey = invoiceDate.toLocaleDateString('en-IN', dateFormat);
      if (salesMap[dateKey] !== undefined) {
        salesMap[dateKey] += Number(invoice.total || 0);
      }
    });
    
    // Convert to array format for charts
    return Object.entries(salesMap).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [getDaysArray]);

  // Calculate category breakdown
  const calculateCategoryBreakdown = useCallback((invoices, products) => {
    const categoryMap = {};
    
    // Map products to categories
    const productCategoryMap = {};
    products.forEach(product => {
      productCategoryMap[product.id] = product.categoryId;
    });
    
    // Aggregate sales by category
    invoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        const categoryId = productCategoryMap[item.id] || 'uncategorized';
        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            id: categoryId,
            name: categoryId === 'uncategorized' ? 'Uncategorized' : `Category ${categoryId}`,
            revenue: 0
          };
        }
        categoryMap[categoryId].revenue += Number(item.price || 0) * Number(item.qty || 0);
      });
    });
    
    // Convert to array for charts
    return Object.values(categoryMap);
  }, []);

  // Calculate analytics metrics
  const calculateAnalytics = useCallback((invoices, products, range) => {
    // Basic metrics
    const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const totalInvoices = invoices.length;
    const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    
    // Product performance
    const productSales = {};
    invoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        const productId = item.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += Number(item.qty || 0);
        productSales[productId].revenue += Number(item.price || 0) * Number(item.qty || 0);
      });
    });
    
    // Convert to array and sort by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Sales by day
    const salesByDay = calculateSalesByDay(invoices, range);
    
    // Product category breakdown
    const productCategoryBreakdown = calculateCategoryBreakdown(invoices, products);
    
    return {
      totalSales,
      totalInvoices,
      averageOrderValue,
      topProducts,
      salesByDay,
      productCategoryBreakdown
    };
  }, [calculateSalesByDay, calculateCategoryBreakdown]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Get all invoices
        const invoices = await getAllInvoices();
        const products = await getAllProducts();
        
        // Filter invoices based on selected time range
        const filteredInvoices = filterInvoicesByTimeRange(invoices, timeRange);
        
        // Calculate analytics data
        const data = calculateAnalytics(filteredInvoices, products, timeRange);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [timeRange, filterInvoicesByTimeRange, calculateAnalytics]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Get percentage change
  const getPercentageChange = (value) => {
    // Simulated values for demo
    const change = Math.random() * 20 - 10;
    return {
      value: change.toFixed(1),
      isPositive: change > 0
    };
  };

  // For chart bars - get a safe height percentage
  const getBarHeight = (value, maxValue) => {
    if (!maxValue) return 0;
    const percentage = (value / maxValue) * 100;
    // Cap at 90% for visual reasons
    return Math.min(percentage, 90);
  };

  // Handle tab swipe
  const handleTabSwipe = (e) => {
    // Simple swipe detection
    const touchStart = e.touches[0].clientX;
    const touchMove = (event) => {
      const touchEnd = event.touches[0].clientX;
      const diff = touchStart - touchEnd;
      
      // Minimum swipe distance (30px)
      if (Math.abs(diff) < 30) return;
      
      const tabs = ['overview', 'products', 'trends'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (diff > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1]);
      }
      
      document.removeEventListener('touchmove', touchMove);
    };
    
    document.addEventListener('touchmove', touchMove, { passive: true });
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', touchMove);
    }, { once: true });
  };

  return (
    <div className="page-container">
      {/* Time Range Filter */}
      <div className="time-filter-wrapper">
        <div className="time-filter">
          <button 
            className={`filter-button ${timeRange === 'today' ? 'active' : ''}`}
            onClick={() => setTimeRange('today')}
          >
            Today
          </button>
          <button 
            className={`filter-button ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`filter-button ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`filter-button ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div 
            className="analytics-tabs"
            onTouchStart={isMobile ? handleTabSwipe : undefined}
          >
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
          </div>

          {/* Overview Tab */}
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Total Sales</h3>
                  <div className={`change-indicator ${getPercentageChange().isPositive ? 'positive' : 'negative'}`}>
                    {getPercentageChange().value}%
                  </div>
                </div>
                <div className="metric-value">{formatCurrency(analyticsData.totalSales)}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Invoices</h3>
                  <div className={`change-indicator ${getPercentageChange().isPositive ? 'positive' : 'negative'}`}>
                    {getPercentageChange().value}%
                  </div>
                </div>
                <div className="metric-value">{analyticsData.totalInvoices}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Avg. Order</h3>
                  <div className={`change-indicator ${getPercentageChange().isPositive ? 'positive' : 'negative'}`}>
                    {getPercentageChange().value}%
                  </div>
                </div>
                <div className="metric-value">{formatCurrency(analyticsData.averageOrderValue)}</div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="chart-container">
              <h3>Sales Trend</h3>
              {/* Sample chart visualization */}
              <div className="chart-content">
                {analyticsData.salesByDay.length > 0 ? (
                  <div className="sample-chart">
                    {analyticsData.salesByDay.map((day, index) => {
                      const maxAmount = Math.max(...analyticsData.salesByDay.map(d => d.amount));
                      const heightPercentage = getBarHeight(day.amount, maxAmount);
                      
                      return (
                        <div 
                          key={index} 
                          className="bar-container"
                        >
                          <div className="bar-value">{formatCurrency(day.amount)}</div>
                          <div 
                            className="sample-bar"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="bar-label">{day.date.split(',')[0]}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="chart-placeholder">
                    <p>No sales data available for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Tab */}
          <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
            <div className="section-header">
              <h3>Top Products</h3>
            </div>
            
            {analyticsData.topProducts.length > 0 ? (
              <div className="product-performance">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="product-card">
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-meta">Sold: {product.quantity}</div>
                    </div>
                    <div className="product-revenue">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No product data available for the selected time period.</p>
              </div>
            )}
            
            {/* Category Distribution */}
            <div className="section-header">
              <h3>Category Distribution</h3>
            </div>
            
            <div className="chart-container">
              {analyticsData.productCategoryBreakdown.length > 0 ? (
                <div className="category-breakdown">
                  {analyticsData.productCategoryBreakdown.map((category, index) => {
                    const total = analyticsData.productCategoryBreakdown.reduce(
                      (sum, cat) => sum + cat.revenue, 0
                    );
                    const percentage = total > 0 ? (category.revenue / total) * 100 : 0;
                    
                    return (
                      <div key={index} className="pie-legend-item">
                        <div 
                          className="color-indicator" 
                          style={{ backgroundColor: getColorForIndex(index) }}
                        ></div>
                        <div className="category-details">
                          <div className="category-name">{category.name}</div>
                          <div className="category-percentage">{percentage.toFixed(1)}%</div>
                        </div>
                        <div className="category-value">{formatCurrency(category.revenue)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>No category data available for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Trends Tab */}
          <div className={`tab-content ${activeTab === 'trends' ? 'active' : ''}`}>
            <div className="section-header">
              <h3>Sales Performance</h3>
            </div>
            
            {/* Would contain trend analysis and comparisons */}
            <div className="trend-comparison">
              <div className="comparison-card">
                <h4>vs Previous Period</h4>
                <div className="comparison-value positive">+12.5%</div>
                <div className="comparison-meta">Sales Growth</div>
              </div>
              
              <div className="comparison-card">
                <h4>Customer Growth</h4>
                <div className="comparison-value positive">+8.3%</div>
                <div className="comparison-meta">New vs Returning</div>
              </div>
            </div>
            
            <div className="trend-analysis">
              <div className="insight-card">
                <div className="insight-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4>Peak Sales Hours</h4>
                  <p>Your busiest hours are typically between 2PM and 5PM. Consider optimizing staffing during these hours.</p>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4>Stock Alert</h4>
                  <p>3 of your top-selling products are running low on inventory. Consider restocking soon.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get color for chart segments
function getColorForIndex(index) {
  const colors = [
    '#4F46E5', // Primary color 
    '#818CF8', // Lighter shade
    '#C7D2FE', // Even lighter
    '#60A5FA', // Blue variation
    '#A78BFA', // Purple variation
    '#34D399', // Green
    '#FBBF24'  // Yellow/amber
  ];
  
  return colors[index % colors.length];
}