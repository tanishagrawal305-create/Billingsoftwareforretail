import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
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

export interface Product {
  id: string;
  name: string;
  category: string;
  type: 'unit' | 'weight';
  unit?: 'kg' | 'g' | 'ltr' | 'ml';
  quantity?: number;
  stock: number;
  barcode?: string;
  gstRate: number;
  priceType: 'fixed' | 'variable';
  price?: number; // Only used when priceType is 'fixed'
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  type: 'unit' | 'weight';
  unit?: 'kg' | 'g' | 'ltr' | 'ml';
  gstRate: number;
  customWeight?: number;
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
  date: string;
  customer?: Customer;
  items: CartItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  applyGst: boolean;
  customerName?: string;
  customerMobile?: string;
  createdAt?: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  cart: CartItem[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (signupData: {
    email: string;
    password: string;
    name: string;
    shopName: string;
    phone: string;
    address: string;
    gstNumber?: string;
  }) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  updateCartItem: (productId: string, quantity: number, customWeight?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  completeSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<void>;
  addSale: (sale: any) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// LocalStorage Keys
const STORAGE_KEYS = {
  USER: 'jr_invoice_user',
  USERS: 'jr_invoice_users',
  PRODUCTS: 'jr_invoice_products',
  SALES: 'jr_invoice_sales',
  CUSTOMERS: 'jr_invoice_customers',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load user session and data on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          loadUserData(parsedUser.id);
        }
      } catch (error) {
        console.error('Session load error:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const loadUserData = (userId: string) => {
    try {
      // Load products
      const storedProducts = localStorage.getItem(`${STORAGE_KEYS.PRODUCTS}_${userId}`);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        // Migration: Add priceType to existing products if missing
        const migratedProducts = parsedProducts.map((p: Product) => ({
          ...p,
          priceType: p.priceType || 'fixed',
          price: p.price !== undefined ? p.price : undefined,
        }));
        setProducts(migratedProducts);
        // Save migrated data back to localStorage
        localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${userId}`, JSON.stringify(migratedProducts));
      }

      // Load sales
      const storedSales = localStorage.getItem(`${STORAGE_KEYS.SALES}_${userId}`);
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }

      // Load customers
      const storedCustomers = localStorage.getItem(`${STORAGE_KEYS.CUSTOMERS}_${userId}`);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signup = async (signupData: {
    email: string;
    password: string;
    name: string;
    shopName: string;
    phone: string;
    address: string;
    gstNumber?: string;
  }): Promise<boolean> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if email already exists
      if (users.some((u: any) => u.email === signupData.email)) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: signupData.email,
        name: signupData.name,
        shopName: signupData.shopName,
        phone: signupData.phone,
        address: signupData.address,
        gstNumber: signupData.gstNumber,
        taxRate: 0,
      };

      // Store password separately (in real app, this would be hashed)
      const userWithPassword = { ...newUser, password: signupData.password };
      users.push(userWithPassword);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Set current user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
      loadUserData(newUser.id);

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        loadUserData(userWithoutPassword.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setProducts([]);
    setSales([]);
    setCustomers([]);
    setCart([]);
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const userIndex = users.findIndex((u: any) => u.email === email);
      if (userIndex === -1) {
        return false;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = { ...user, ...updates };

      // Update in users list
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // Update current user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    if (!user) return;

    try {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${user.id}`, JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!user) return;

    try {
      const updatedProducts = products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${user.id}`, JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!user) return;

    try {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${user.id}`, JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  };

  const addToCart = (item: CartItem): void => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.productId === item.productId);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prev, item];
    });
  };

  const updateCartItem = (productId: string, quantity: number, customWeight?: number): void => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, customWeight }
          : item
      )
    );
  };

  const removeFromCart = (productId: string): void => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = (): void => {
    setCart([]);
  };

  const completeSale = async (sale: Omit<Sale, 'id' | 'date'>): Promise<void> => {
    if (!user) return;

    try {
      const newSale: Sale = {
        ...sale,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };

      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      localStorage.setItem(`${STORAGE_KEYS.SALES}_${user.id}`, JSON.stringify(updatedSales));

      // Update product stock
      const updatedProducts = products.map((p) => {
        const saleItem = sale.items.find((item) => item.productId === p.id);
        if (saleItem) {
          return { ...p, stock: p.stock - saleItem.quantity };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${user.id}`, JSON.stringify(updatedProducts));

      clearCart();
    } catch (error) {
      console.error('Complete sale error:', error);
      throw error;
    }
  };

  const addSale = async (sale: any): Promise<void> => {
    if (!user) return;

    try {
      const newSale: Sale = {
        ...sale,
        id: sale.id || Date.now().toString(),
        date: sale.date || new Date().toISOString(),
      };

      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      localStorage.setItem(`${STORAGE_KEYS.SALES}_${user.id}`, JSON.stringify(updatedSales));

      // Update product stock
      const updatedProducts = products.map((p) => {
        const saleItem = sale.items.find((item: any) => item.productId === p.id);
        if (saleItem) {
          return { ...p, stock: p.stock - saleItem.quantity };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_${user.id}`, JSON.stringify(updatedProducts));

      clearCart();
    } catch (error) {
      console.error('Add sale error:', error);
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    if (!user) throw new Error('Not authenticated');

    try {
      const newCustomer: Customer = {
        ...customer,
        id: Date.now().toString(),
      };

      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      localStorage.setItem(`${STORAGE_KEYS.CUSTOMERS}_${user.id}`, JSON.stringify(updatedCustomers));

      return newCustomer;
    } catch (error) {
      console.error('Add customer error:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
    if (!user) return;

    try {
      const updatedCustomers = customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      setCustomers(updatedCustomers);
      localStorage.setItem(`${STORAGE_KEYS.CUSTOMERS}_${user.id}`, JSON.stringify(updatedCustomers));
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        products,
        sales,
        customers,
        cart,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        completeSale,
        addSale,
        addCustomer,
        updateCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};