import React, { useState, useEffect } from 'react';
import './CustomerList.css';
import { addCustomer, getAllCustomers, deleteCustomer } from '../utils/storage';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');

    // Load all customers when component mounts
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const allCustomers = await getAllCustomers();
        setCustomers(allCustomers);
    };

    const handleAddCustomer = async () => {
        if (newCustomerName.trim() === '' || newCustomerEmail.trim() === '') {
            alert('Please enter name and email.');
            return;
        }
        await addCustomer({
            name: newCustomerName,
            email: newCustomerEmail,
        });
        setNewCustomerName('');
        setNewCustomerEmail('');
        fetchCustomers();
    };

    const handleDelete = async (id) => {
        await deleteCustomer(id);
        fetchCustomers();
    };

    return (
        <div className="customer-list">
            <h2>Customer List</h2>

            <div className="add-customer-form">
                <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                />
                <button className="button" onClick={handleAddCustomer}>Add Customer</button>
            </div>

            <ul>
                {customers.map(customer => (
                    <li key={customer.id} className="customer-item">
                        <span>{customer.name} - {customer.email}</span>
                        <button className="delete-btn" onClick={() => handleDelete(customer.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
