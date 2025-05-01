import React, { useState } from 'react';
import './CreateInvoice.css';

export default function CreateInvoice() {
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState([{ name: '', qty: 1, price: 0 }]);

    const addItem = () => {
        setItems([...items, { name: '', qty: 1, price: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.qty * item.price), 0).toFixed(2);
    };

    return (
        <div className="create-invoice">
            <h2>Create Invoice</h2>
            <input
                type="text"
                placeholder="Customer Name"
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
            />

            {items.map((item, index) => (
                <div key={index} className="item-row">
                    <input
                        type="text"
                        placeholder="Item Name"
                        className="input small"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Qty"
                        className="input smaller"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        className="input smaller"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    />
                </div>
            ))}

            <button onClick={addItem} className="button">
                Add Item
            </button>

            <div className="total">
                <strong>Total:</strong> ${calculateTotal()}
            </div>
        </div>
    );
}
