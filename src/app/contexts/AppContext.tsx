import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  type: 'unit' | 'weight';
  unit?: string; // for weight-based: kg, g, ml, ltr
  quantity?: number; // for weight-based products, this is the weight value
  stock: number;
  barcode?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
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
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'paytm' | 'card';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
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

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedCustomers = localStorage.getItem('customers');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  // Save data to localStorage
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
      setUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name });
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string, name: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) return false;

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    return true;
  };

  const logout = () => {
    setUser(null);
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

    // Update product stock
    sale.items.forEach((item) => {
      updateProduct(item.productId, {
        stock: products.find((p) => p.id === item.productId)!.stock - item.quantity,
      });
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

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sales,
        addSale,
        customers,
        addCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
