// src/utils/storage.js

import { openDB } from 'idb';

const DB_NAME = 'BillingAppDB';
const DB_VERSION = 1;

/**
 * Initialize (or upgrade) the IndexedDB database and object stores.
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('invoices')) {
        db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

/**
 * Category helpers
 */
export const addCategory = async (cat) => {
  const db = await initDB();
  return db.add('categories', cat);
};

export const getAllCategories = async () => {
  const db = await initDB();
  return db.getAll('categories');
};

export const updateCategory = async (cat) => {
  const db = await initDB();
  return db.put('categories', cat);
};

export const deleteCategory = async (id) => {
  const db = await initDB();
  return db.delete('categories', id);
};

/**
 * Product helpers
 */
export const addProduct = async (prod) => {
  const db = await initDB();
  return db.add('products', prod);
};

export const getAllProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

export const getProductsByCategory = async (catId) => {
  const db = await initDB();
  const all = await db.getAll('products');
  return all.filter(p => p.categoryId === catId);
};

export const updateProduct = async (prod) => {
  const db = await initDB();
  return db.put('products', prod);
};

export const deleteProduct = async (id) => {
  const db = await initDB();
  return db.delete('products', id);
};

/**
 * Invoice helpers
 */
export const addInvoice = async (inv) => {
  // Ensure invoice has a date if not provided
  if (!inv.date) {
    inv.date = new Date().toISOString().split('T')[0];
  }
  
  // Ensure invoice has a creation timestamp
  if (!inv.createdAt) {
    inv.createdAt = new Date().toISOString();
  }
  
  const db = await initDB();
  return db.add('invoices', inv);
};

export const getInvoicesByDate = async (date) => {
  const db = await initDB();
  const all = await db.getAll('invoices');
  return all.filter(i => i.date === date);
};

export const getAllInvoices = async () => {
  const db = await initDB();
  return db.getAll('invoices');
};

export const updateInvoice = async (inv) => {
  const db = await initDB();
  return db.put('invoices', inv);
};

export const deleteInvoice = async (id) => {
  const db = await initDB();
  return db.delete('invoices', id);
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id) => {
  const db = await initDB();
  return db.get('invoices', id);
};

/**
 * Settings helpers
 */
export const saveSettings = async (s) => {
  const db = await initDB();
  return db.put('settings', s);
};

export const getSettings = async () => {
  const db = await initDB();
  const arr = await db.getAll('settings');
  return arr.reduce((acc, cur) => {
    acc[cur.key] = cur.value;
    return acc;
  }, {});
};

/**
 * Get dashboard statistics for the current day
 */
export const getDashboardStats = async () => {
  const db = await initDB();
  const invoices = await db.getAll('invoices');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter invoices for today
  const todayInvoices = invoices.filter(inv => inv.date === today);
  
  // Calculate total sales for today
  const todaySales = todayInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0), 
    0
  );
  
  // Count pending invoices
  const pendingInvoices = invoices.filter(inv => 
    inv.status === 'pending' || inv.status === 'unpaid'
  ).length;
  
  // Get most recent invoices (up to 5)
  const recentInvoices = [...invoices]
    .sort((a, b) => {
      // Sort by createdAt timestamp if available, otherwise by date
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  return {
    todaySales,
    totalInvoices: invoices.length,
    pendingInvoices,
    recentInvoices
  };
};

export default {
  // Database initialization
  initDB,
  
  // Category methods
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  
  // Product methods
  addProduct,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  
  // Invoice methods
  addInvoice,
  getAllInvoices,
  getInvoicesByDate,
  updateInvoice,
  deleteInvoice,
  getInvoiceById,
  
  // Settings methods
  saveSettings,
  getSettings,
  
  // Dashboard methods
  getDashboardStats
};


// Add these functions to your existing storage.js file to support analytics

/**
 * Get analytics data for a specific time range
 * @param {string} timeRange - 'today', 'week', 'month', 'year'
 * @returns {Promise<Object>} Promise that resolves with analytics data
 */
export const getAnalyticsData = async (timeRange = 'week') => {
  const db = await initDB();
  
  // Get all invoices and products
  const invoices = await db.getAll('invoices');
  const products = await db.getAll('products');
  const categories = await db.getAll('categories');
  
  // Filter invoices based on time range
  const filteredInvoices = filterInvoicesByTimeRange(invoices, timeRange);
  
  // Calculate analytics metrics
  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalInvoices = filteredInvoices.length;
  const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
  
  // Calculate product performance
  const productPerformance = calculateProductPerformance(filteredInvoices, products);
  
  // Calculate sales by day
  const salesByDay = calculateSalesByDay(filteredInvoices, timeRange);
  
  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(filteredInvoices, products, categories);
  
  return {
    totalSales,
    totalInvoices,
    averageOrderValue,
    productPerformance,
    salesByDay,
    categoryBreakdown,
    timeRange
  };
};

/**
 * Filter invoices based on selected time range
 * @param {Array} invoices - Array of invoice objects
 * @param {string} range - 'today', 'week', 'month', 'year'
 * @returns {Array} Filtered invoices
 */
const filterInvoicesByTimeRange = (invoices, range) => {
  const now = new Date();
  let startDate;
  
  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
  }
  
  return invoices.filter(invoice => new Date(invoice.datetime) >= startDate);
};

/**
 * Calculate product performance metrics
 * @param {Array} invoices - Array of invoice objects
 * @param {Array} products - Array of product objects
 * @returns {Array} Top performing products
 */
const calculateProductPerformance = (invoices, products) => {
  const productMap = {};
  
  // Create a map of products for quick lookup
  products.forEach(product => {
    productMap[product.id] = product;
  });
  
  // Calculate product performance
  const productStats = {};
  
  invoices.forEach(invoice => {
    invoice.items?.forEach(item => {
      const productId = item.id;
      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          name: item.name || (productMap[productId]?.name || 'Unknown Product'),
          quantity: 0,
          revenue: 0,
          orders: 0
        };
      }
      
      productStats[productId].quantity += Number(item.qty || 0);
      productStats[productId].revenue += Number(item.price || 0) * Number(item.qty || 0);
      productStats[productId].orders += 1;
    });
  });
  
  // Convert to array and sort by revenue
  return Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
};

/**
 * Calculate sales by day for the chart
 * @param {Array} invoices - Array of invoice objects
 * @param {string} range - 'today', 'week', 'month', 'year'
 * @returns {Array} Daily sales data
 */
const calculateSalesByDay = (invoices, range) => {
  // Determine date format and grouping based on range
  let format = { day: '2-digit', month: 'short' };
  let groupBy = 'day';
  
  if (range === 'today') {
    format = { hour: '2-digit' };
    groupBy = 'hour';
  } else if (range === 'year') {
    format = { month: 'short' };
    groupBy = 'month';
  }
  
  // Initialize sales map
  const salesMap = {};
  
  // Generate time slots
  const now = new Date();
  
  if (groupBy === 'hour') {
    // For today, show hourly data
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i);
      const key = hour.toLocaleString('en-IN', format);
      salesMap[key] = 0;
    }
  } else if (groupBy === 'month') {
    // For year, show monthly data
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), i, 1);
      const key = month.toLocaleString('en-IN', format);
      salesMap[key] = 0;
    }
  } else {
    // For week/month, show daily data
    const days = range === 'week' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toLocaleString('en-IN', format);
      salesMap[key] = 0;
    }
  }
  
  // Aggregate sales data
  invoices.forEach(invoice => {
    const date = new Date(invoice.datetime);
    let key;
    
    if (groupBy === 'hour') {
      key = date.toLocaleString('en-IN', format);
    } else if (groupBy === 'month') {
      key = date.toLocaleString('en-IN', format);
    } else {
      key = date.toLocaleString('en-IN', format);
    }
    
    if (salesMap[key] !== undefined) {
      salesMap[key] += Number(invoice.total || 0);
    }
  });
  
  // Convert to array format for charts
  return Object.entries(salesMap).map(([date, amount]) => ({
    date,
    amount
  }));
};

/**
 * Calculate category breakdown
 * @param {Array} invoices - Array of invoice objects
 * @param {Array} products - Array of product objects
 * @param {Array} categories - Array of category objects
 * @returns {Array} Category breakdown data
 */
const calculateCategoryBreakdown = (invoices, products, categories) => {
  const categoryMap = {};
  const productCategoryMap = {};
  
  // Create lookup maps
  categories.forEach(category => {
    categoryMap[category.id] = category.name;
  });
  
  products.forEach(product => {
    productCategoryMap[product.id] = product.categoryId;
  });
  
  // Calculate sales by category
  const categoryStats = {};
  
  invoices.forEach(invoice => {
    invoice.items?.forEach(item => {
      const productId = item.id;
      const categoryId = productCategoryMap[productId] || 'uncategorized';
      const categoryName = categoryMap[categoryId] || 'Uncategorized';
      
      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          id: categoryId,
          name: categoryName,
          revenue: 0,
          quantity: 0
        };
      }
      
      categoryStats[categoryId].revenue += Number(item.price || 0) * Number(item.qty || 0);
      categoryStats[categoryId].quantity += Number(item.qty || 0);
    });
  });
  
  // Convert to array for charts
  return Object.values(categoryStats);
};

/**
 * Get sales comparison with previous period
 * @param {string} timeRange - 'today', 'week', 'month', 'year'
 * @returns {Promise<Object>} Promise with comparison data
 */
export const getSalesComparison = async (timeRange = 'week') => {
  const db = await initDB();
  const invoices = await db.getAll('invoices');
  
  // Current period
  const currentPeriodInvoices = filterInvoicesByTimeRange(invoices, timeRange);
  const currentTotal = currentPeriodInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
  // Previous period
  const now = new Date();
  let previousStart, previousEnd, currentStart;
  
  switch (timeRange) {
    case 'today':
      previousStart = new Date(now);
      previousStart.setDate(previousStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      
      previousEnd = new Date(now);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      
      currentStart = new Date(now);
      currentStart.setHours(0, 0, 0, 0);
      break;
      
    case 'week':
      previousStart = new Date(now);
      previousStart.setDate(previousStart.getDate() - 14);
      
      previousEnd = new Date(now);
      previousEnd.setDate(previousEnd.getDate() - 7);
      
      currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - 7);
      break;
      
    case 'month':
      previousStart = new Date(now);
      previousStart.setMonth(previousStart.getMonth() - 2);
      
      previousEnd = new Date(now);
      previousEnd.setMonth(previousEnd.getDate() - 1);
      
      currentStart = new Date(now);
      currentStart.setMonth(currentStart.getMonth() - 1);
      break;
      
    case 'year':
      previousStart = new Date(now);
      previousStart.setFullYear(previousStart.getFullYear() - 2);
      
      previousEnd = new Date(now);
      previousEnd.setFullYear(previousEnd.getFullYear() - 1);
      
      currentStart = new Date(now);
      currentStart.setFullYear(currentStart.getFullYear() - 1);
      break;
  }
  
  const previousPeriodInvoices = invoices.filter(inv => {
    const date = new Date(inv.datetime);
    return date >= previousStart && date <= previousEnd;
  });
  
  const previousTotal = previousPeriodInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
  // Calculate growth rate
  let growthRate = 0;
  
  if (previousTotal > 0) {
    growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
  }
  
  return {
    currentPeriod: {
      total: currentTotal,
      invoiceCount: currentPeriodInvoices.length
    },
    previousPeriod: {
      total: previousTotal,
      invoiceCount: previousPeriodInvoices.length
    },
    growthRate: parseFloat(growthRate.toFixed(1)),
    invoiceGrowthRate: previousPeriodInvoices.length > 0 
      ? parseFloat((((currentPeriodInvoices.length - previousPeriodInvoices.length) / previousPeriodInvoices.length) * 100).toFixed(1))
      : 0
  };
};