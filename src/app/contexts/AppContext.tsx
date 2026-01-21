import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    shopName: string;
    phone: string;
    address: string;
    gstNumber?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1f56888c`;

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setAccessToken(token);
            await fetchData(token);
          } else {
            localStorage.removeItem('accessToken');
          }
        } catch (error) {
          console.error('Session check error:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [productsRes, salesRes, customersRes] = await Promise.all([
        fetch(`${API_BASE}/products`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/sales`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/customers`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }

      if (salesRes.ok) {
        const data = await salesRes.json();
        setSales(data.sales || []);
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        await fetchData(data.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
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
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Auto-login after signup
        return await login(signupData.email, signupData.password);
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (accessToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setProducts([]);
      setSales([]);
      setCustomers([]);
      localStorage.removeItem('accessToken');
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      return response.ok;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts((prev) => [...prev, data.product]);
      }
    } catch (error) {
      console.error('Add product error:', error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? data.product : product))
        );
      }
    } catch (error) {
      console.error('Update product error:', error);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        const data = await response.json();
        setSales((prev) => [...prev, data.sale]);
        
        // Update local product stock
        sale.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === item.productId
                  ? { ...p, stock: p.stock - item.quantity }
                  : p
              )
            );
          }
        });
      }
    } catch (error) {
      console.error('Add sale error:', error);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(customer),
      });

      if (response.ok) {
        const data = await response.json();
        const existingCustomer = customers.find((c) => c.mobile === customer.mobile);
        if (!existingCustomer) {
          setCustomers((prev) => [...prev, data.customer]);
        }
      }
    } catch (error) {
      console.error('Add customer error:', error);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === id ? data.customer : customer))
        );
      }
    } catch (error) {
      console.error('Update customer error:', error);
    }
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
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
