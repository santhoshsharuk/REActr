import { openDB } from 'idb';

const DB_NAME = 'BillingAppDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addCustomer = async (customer) => {
  const db = await initDB();
  return db.add('customers', customer);
};

export const getAllCustomers = async () => {
  const db = await initDB();
  return db.getAll('customers');
};

export const deleteCustomer = async (id) => {
  const db = await initDB();
  return db.delete('customers', id);
};

export const addProduct = async (product) => {
  const db = await initDB();
  return db.add('products', product);
};

export const getAllProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

export const deleteProduct = async (id) => {
  const db = await initDB();
  return db.delete('products', id);
};
