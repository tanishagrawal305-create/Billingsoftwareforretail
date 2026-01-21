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

// Simple hash function for passwords
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'jr_invoice_users',
  CURRENT_USER: 'jr_invoice_current_user',
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

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Clear old data if schema has changed (migration)
        const migrationKey = 'jr_invoice_migration_v2';
        const migrationDone = localStorage.getItem(migrationKey);
        
        if (!migrationDone) {
          // Clear all data to start fresh with new schema
          localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
          localStorage.removeItem(STORAGE_KEYS.SALES);
          localStorage.setItem(migrationKey, 'done');
          console.log('Data migration completed - old product data cleared');
        }
        
        // Load current user
        const currentUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          setUser(currentUser);
          
          // Load user-specific data
          loadUserData(currentUser.id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadUserData = (userId: string) => {
    try {
      const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const salesStr = localStorage.getItem(STORAGE_KEYS.SALES);
      const customersStr = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);

      if (productsStr) {
        const allProducts = JSON.parse(productsStr);
        setProducts(allProducts.filter((p: any) => p.userId === userId));
      }

      if (salesStr) {
        const allSales = JSON.parse(salesStr);
        setSales(allSales.filter((s: any) => s.userId === userId));
      }

      if (customersStr) {
        const allCustomers = JSON.parse(customersStr);
        setCustomers(allCustomers.filter((c: any) => c.userId === userId));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    try {
      const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const allProducts = productsStr ? JSON.parse(productsStr) : [];
      
      // Remove current user's products and add new ones
      const otherProducts = allProducts.filter((p: any) => p.userId !== user?.id);
      const updatedProducts = [...otherProducts, ...newProducts.map(p => ({ ...p, userId: user?.id }))];
      
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const saveSales = (newSales: Sale[]) => {
    try {
      const salesStr = localStorage.getItem(STORAGE_KEYS.SALES);
      const allSales = salesStr ? JSON.parse(salesStr) : [];
      
      // Remove current user's sales and add new ones
      const otherSales = allSales.filter((s: any) => s.userId !== user?.id);
      const updatedSales = [...otherSales, ...newSales.map(s => ({ ...s, userId: user?.id }))];
      
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));
      setSales(newSales);
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  };

  const saveCustomers = (newCustomers: Customer[]) => {
    try {
      const customersStr = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const allCustomers = customersStr ? JSON.parse(customersStr) : [];
      
      // Remove current user's customers and add new ones
      const otherCustomers = allCustomers.filter((c: any) => c.userId !== user?.id);
      const updatedCustomers = [...otherCustomers, ...newCustomers.map(c => ({ ...c, userId: user?.id }))];
      
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      setCustomers(newCustomers);
    } catch (error) {
      console.error('Error saving customers:', error);
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
      const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : [];

      // Check if email already exists
      if (users.find((u: any) => u.email.toLowerCase() === signupData.email.toLowerCase())) {
        console.error('Email already registered');
        return false;
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        email: signupData.email.toLowerCase(),
        password: hashPassword(signupData.password),
        name: signupData.name,
        shopName: signupData.shopName,
        phone: signupData.phone,
        address: signupData.address,
        gstNumber: signupData.gstNumber || '',
        shopLogo: '',
        taxRate: 5,
      };

      // Save user
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Create sample products for new user
      const sampleProducts: Product[] = [
        { id: `${newUser.id}-1`, name: 'Rice', category: 'Grocery', type: 'weight', unit: 'kg', quantity: 1, stock: 100, barcode: '1001', gstRate: 5 },
        { id: `${newUser.id}-2`, name: 'Wheat Flour', category: 'Grocery', type: 'weight', unit: 'kg', quantity: 1, stock: 80, barcode: '1002', gstRate: 5 },
        { id: `${newUser.id}-3`, name: 'Sugar', category: 'Grocery', type: 'weight', unit: 'kg', quantity: 1, stock: 60, barcode: '1003', gstRate: 5 },
        { id: `${newUser.id}-4`, name: 'Milk', category: 'Dairy', type: 'weight', unit: 'ltr', quantity: 1, stock: 50, barcode: '1004', gstRate: 5 },
        { id: `${newUser.id}-5`, name: 'Bread', category: 'Bakery', type: 'unit', stock: 40, barcode: '1005', gstRate: 5 },
        { id: `${newUser.id}-6`, name: 'Eggs', category: 'Dairy', type: 'unit', stock: 200, barcode: '1006', gstRate: 5 },
        { id: `${newUser.id}-7`, name: 'Tea Powder', category: 'Beverage', type: 'weight', unit: 'g', quantity: 250, stock: 30, barcode: '1007', gstRate: 5 },
        { id: `${newUser.id}-8`, name: 'Coffee', category: 'Beverage', type: 'weight', unit: 'g', quantity: 200, stock: 25, barcode: '1008', gstRate: 5 },
      ].map(p => ({ ...p, userId: newUser.id } as any));

      const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const allProducts = productsStr ? JSON.parse(productsStr) : [];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([...allProducts, ...sampleProducts]));

      // Auto-login
      return await login(signupData.email, signupData.password);
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : [];

      const user = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === hashPassword(password)
      );

      if (!user) {
        console.error('Invalid email or password');
        return false;
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
      
      // Load user data
      loadUserData(user.id);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setProducts([]);
    setSales([]);
    setCustomers([]);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : [];

      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex === -1) {
        console.error('User not found');
        return false;
      }

      users[userIndex].password = hashPassword(newPassword);
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
      const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersStr ? JSON.parse(usersStr) : [];

      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex === -1) return false;

      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    if (!user) return;

    const newProduct: Product = {
      ...product,
      id: `${user.id}-${Date.now()}`,
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveProducts(updatedProducts);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const updatedProducts = products.filter((p) => p.id !== id);
    saveProducts(updatedProducts);
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

    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedSales = [...sales, newSale];
    saveSales(updatedSales);

    // Update product stock
    const updatedProducts = products.map((p) => {
      const saleItem = sale.items.find((item) => item.productId === p.id);
      if (saleItem) {
        return { ...p, stock: p.stock - saleItem.quantity };
      }
      return p;
    });
    saveProducts(updatedProducts);

    clearCart();
  };

  const addSale = async (sale: any): Promise<void> => {
    if (!user) return;

    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedSales = [...sales, newSale];
    saveSales(updatedSales);

    // Update product stock
    const updatedProducts = products.map((p) => {
      const saleItem = sale.items.find((item: any) => item.productId === p.id);
      if (saleItem) {
        return { ...p, stock: p.stock - saleItem.quantity };
      }
      return p;
    });
    saveProducts(updatedProducts);

    clearCart();
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    if (!user) throw new Error('Not authenticated');

    // Check if customer with mobile already exists
    const existing = customers.find((c) => c.mobile === customer.mobile);
    if (existing) {
      return existing;
    }

    const newCustomer: Customer = {
      ...customer,
      id: `customer-${Date.now()}`,
    };

    const updatedCustomers = [...customers, newCustomer];
    saveCustomers(updatedCustomers);

    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
    const updatedCustomers = customers.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    saveCustomers(updatedCustomers);
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