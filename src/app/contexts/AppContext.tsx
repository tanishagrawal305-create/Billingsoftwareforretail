import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  type: 'unit' | 'weight';
  unit?: string;
  quantity?: number;
  stock: number;
  barcode?: string;
  image?: string;
  gstRate: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gstNumber?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    weight?: number;
    unit?: string;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  gstEnabled: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  gstNumber?: string;
  shopLogo?: string;
  taxRate: number;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    shopName: string;
    phone: string;
    address: string;
    gstNumber?: string;
  }) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  resetPassword: (email: string, newPassword: string) => boolean;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedCustomers = localStorage.getItem('customers');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      // Add sample products
      const sampleProducts: Product[] = [
        { id: '1', name: 'Rice', category: 'Grocery', price: 45, type: 'weight', unit: 'kg', quantity: 1, stock: 100, barcode: '1001', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '2', name: 'Wheat Flour', category: 'Grocery', price: 40, type: 'weight', unit: 'kg', quantity: 1, stock: 80, barcode: '1002', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '3', name: 'Sugar', category: 'Grocery', price: 42, type: 'weight', unit: 'kg', quantity: 1, stock: 60, barcode: '1003', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '4', name: 'Milk', category: 'Dairy', price: 60, type: 'weight', unit: 'ltr', quantity: 1, stock: 50, barcode: '1004', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '5', name: 'Bread', category: 'Bakery', price: 35, type: 'unit', stock: 40, barcode: '1005', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '6', name: 'Eggs', category: 'Dairy', price: 6, type: 'unit', stock: 200, barcode: '1006', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '7', name: 'Tea Powder', category: 'Beverage', price: 180, type: 'weight', unit: 'g', quantity: 250, stock: 30, barcode: '1007', gstRate: 5, createdAt: new Date().toISOString() },
        { id: '8', name: 'Coffee', category: 'Beverage', price: 220, type: 'weight', unit: 'g', quantity: 200, stock: 25, barcode: '1008', gstRate: 5, createdAt: new Date().toISOString() },
      ];
      setProducts(sampleProducts);
      localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    if (foundUser) {
      setUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name, shopName: foundUser.shopName, phone: foundUser.phone, address: foundUser.address, gstNumber: foundUser.gstNumber, shopLogo: foundUser.shopLogo, taxRate: foundUser.taxRate });
      return true;
    }
    return false;
  };

  const signup = (data: {
    email: string;
    password: string;
    name: string;
    shopName: string;
    phone: string;
    address: string;
    gstNumber?: string;
  }): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === data.email);
    if (existingUser) return false;

    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name,
      shopName: data.shopName,
      phone: data.phone,
      address: data.address,
      gstNumber: data.gstNumber,
      shopLogo: '',
      taxRate: 5,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name, shopName: newUser.shopName, phone: newUser.phone, address: newUser.address, gstNumber: newUser.gstNumber, shopLogo: newUser.shopLogo, taxRate: newUser.taxRate });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const resetPassword = (email: string, newPassword: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates } : product))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [...prev, newSale]);

    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProduct(item.productId, {
          stock: product.stock - item.quantity,
        });
      }
    });
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const existingCustomer = customers.find((c) => c.mobile === customer.mobile);
    if (existingCustomer) return;

    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, ...updates } : customer))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        resetPassword,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sales,
        addSale,
        customers,
        addCustomer,
        updateCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};