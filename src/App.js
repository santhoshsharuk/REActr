import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateInvoice from './components/CreateInvoice';
import CustomerList from './components/CustomerList';
import ProductCatalog from './components/ProductCatalog';
import InvoiceHistory from './components/InvoiceHistory';
import './App.css';

export default function App() {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <Link to="/">Dashboard</Link>
                    <Link to="/create-invoice">Create Invoice</Link>
                    <Link to="/customers">Customers</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/invoices">Invoices</Link>
                </nav>

                <div className="content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/create-invoice" element={<CreateInvoice />} />
                        <Route path="/customers" element={<CustomerList />} />
                        <Route path="/products" element={<ProductCatalog />} />
                        <Route path="/invoices" element={<InvoiceHistory />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
