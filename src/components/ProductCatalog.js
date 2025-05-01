import React, { useState, useEffect } from 'react';
import './ProductCatalog.css';
import { addProduct, getAllProducts, deleteProduct } from '../utils/storage';

export default function ProductCatalog() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
    };

    const handleAddProduct = async () => {
        if (name.trim() === '' || price.trim() === '' || stock.trim() === '') {
            alert('Please enter all fields.');
            return;
        }
        await addProduct({
            name,
            price: parseFloat(price),
            stock: parseInt(stock)
        });
        setName('');
        setPrice('');
        setStock('');
        fetchProducts();
    };

    const handleDelete = async (id) => {
        await deleteProduct(id);
        fetchProducts();
    };

    return (
        <div className="product-catalog">
            <h2>Product Catalog</h2>

            <div className="add-product-form">
                <input
                    type="text"
                    placeholder="Product Name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Price"
                    className="input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Stock"
                    className="input"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />
                <button className="button" onClick={handleAddProduct}>Add Product</button>
            </div>

            <ul>
                {products.map(product => (
                    <li key={product.id} className="product-item">
                        <span>{product.name}</span>
                        <span>${product.price.toFixed(2)} - Stock: {product.stock}</span>
                        <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
