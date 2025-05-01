import React, { useState } from 'react';
import './InvoiceHistory.css';

export default function InvoiceHistory() {
    const [invoices, setInvoices] = useState([
        { id: 'INV001', customer: 'John Doe', total: 100.00, date: '2024-04-25' },
        { id: 'INV002', customer: 'Jane Smith', total: 150.00, date: '2024-04-26' },
    ]);

    return (
        <div className="invoice-history">
            <h2>Invoice History</h2>
            <ul>
                {invoices.map(invoice => (
                    <li key={invoice.id} className="invoice-item">
                        <span>{invoice.id} - {invoice.customer}</span>
                        <span>${invoice.total.toFixed(2)} on {invoice.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
