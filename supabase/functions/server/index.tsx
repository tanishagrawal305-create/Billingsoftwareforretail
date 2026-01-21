import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const app = new Hono();

// Simple token generation
const generateToken = () => {
  return crypto.randomUUID() + '-' + Date.now();
};

// Helper to validate token
const getUserFromToken = async (token: string) => {
  const session = await kv.get(`session:${token}`);
  if (!session || !session.userId) {
    return null;
  }
  
  // Check if session expired (7 days)
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
    await kv.del(`session:${token}`);
    return null;
  }
  
  return session.userId;
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1f56888c/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check KV store
app.get("/make-server-1f56888c/debug/check-data", async (c) => {
  try {
    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    const allEmails = await kv.getByPrefix("email:");
    const allProducts = await kv.getByPrefix("product:");
    const allSales = await kv.getByPrefix("sale:");
    const allCustomers = await kv.getByPrefix("customer:");
    const allSessions = await kv.getByPrefix("session:");
    
    return c.json({ 
      success: true,
      counts: {
        users: allUsers.length,
        emails: allEmails.length,
        products: allProducts.length,
        sales: allSales.length,
        customers: allCustomers.length,
        sessions: allSessions.length,
      },
      users: allUsers,
      emails: allEmails,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ========== AUTHENTICATION ROUTES ==========

// Signup
app.post("/make-server-1f56888c/auth/signup", async (c) => {
  try {
    const { email, password, name, shopName, phone, address, gstNumber } = await c.req.json();
    
    console.log('=== SIGNUP DEBUG ===');
    console.log('Email:', email);
    console.log('Environment variables check:');
    console.log('- SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING');
    console.log('- SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'SET' : 'MISSING');
    
    // Check if user already exists
    console.log('Checking if email exists...');
    const existingUser = await kv.get(`email:${email.toLowerCase()}`);
    console.log('Existing user check result:', existingUser ? 'EXISTS' : 'NOT FOUND');
    
    if (existingUser) {
      console.log('Email already exists:', email);
      return c.json({ error: 'Email already registered' }, 400);
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password);
    console.log('Password hashed successfully');
    
    // Create user
    const userId = crypto.randomUUID();
    console.log('Generated user ID:', userId);
    
    const user = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      shopName,
      phone,
      address,
      gstNumber: gstNumber || '',
      shopLogo: '',
      taxRate: 5,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Saving user to KV store...');
    await kv.set(`user:${userId}`, user);
    console.log('User saved successfully');
    
    console.log('Saving email mapping...');
    await kv.set(`email:${email.toLowerCase()}`, userId);
    console.log('Email mapping saved successfully');
    
    console.log('User created successfully, ID:', userId);

    // Initialize sample products for new user
    const sampleProducts = [
      { id: `${userId}-1`, userId, name: 'Rice', category: 'Grocery', price: 45, type: 'weight', unit: 'kg', quantity: 1, stock: 100, barcode: '1001', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-2`, userId, name: 'Wheat Flour', category: 'Grocery', price: 40, type: 'weight', unit: 'kg', quantity: 1, stock: 80, barcode: '1002', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-3`, userId, name: 'Sugar', category: 'Grocery', price: 42, type: 'weight', unit: 'kg', quantity: 1, stock: 60, barcode: '1003', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-4`, userId, name: 'Milk', category: 'Dairy', price: 60, type: 'weight', unit: 'ltr', quantity: 1, stock: 50, barcode: '1004', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-5`, userId, name: 'Bread', category: 'Bakery', price: 35, type: 'unit', stock: 40, barcode: '1005', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-6`, userId, name: 'Eggs', category: 'Dairy', price: 6, type: 'unit', stock: 200, barcode: '1006', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-7`, userId, name: 'Tea Powder', category: 'Beverage', price: 180, type: 'weight', unit: 'g', quantity: 250, stock: 30, barcode: '1007', gstRate: 5, createdAt: new Date().toISOString() },
      { id: `${userId}-8`, userId, name: 'Coffee', category: 'Beverage', price: 220, type: 'weight', unit: 'g', quantity: 200, stock: 25, barcode: '1008', gstRate: 5, createdAt: new Date().toISOString() },
    ];

    console.log('Saving sample products...');
    for (const product of sampleProducts) {
      await kv.set(`product:${userId}:${product.id}`, product);
    }
    console.log('Sample products created for user:', userId);
    
    // Create session
    const token = generateToken();
    console.log('Creating session with token...');
    await kv.set(`session:${token}`, {
      userId,
      createdAt: new Date().toISOString(),
    });
    console.log('Session created successfully');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('=== SIGNUP SUCCESS ===');
    return c.json({ 
      success: true, 
      accessToken: token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.log('=== SIGNUP ERROR ===');
    console.log('Error message:', error.message);
    console.log('Error name:', error.name);
    console.log('Error stack:', error.stack);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    return c.json({ 
      error: error.message || 'Signup failed',
      code: error.code || 500,
      details: error.toString()
    }, 500);
  }
});

// Login
app.post("/make-server-1f56888c/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('Attempting login for email:', email);
    
    // Get user ID from email
    const userId = await kv.get(`email:${email.toLowerCase()}`);
    if (!userId) {
      console.log('Email not found:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    // Get user data
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      console.log('User data not found for ID:', userId);
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Password mismatch for email:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    console.log('Login successful for user:', userId);
    
    // Create session
    const token = generateToken();
    await kv.set(`session:${token}`, {
      userId,
      createdAt: new Date().toISOString(),
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return c.json({ 
      success: true, 
      accessToken: token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.log('Login error:', error);
    return c.json({ error: error.message || 'Login failed' }, 500);
  }
});

// Get current user session
app.get("/make-server-1f56888c/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return c.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.log('Session error:', error);
    return c.json({ error: error.message || 'Session check failed' }, 500);
  }
});

// Logout
app.post("/make-server-1f56888c/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      await kv.del(`session:${accessToken}`);
    }
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Logout error:', error);
    return c.json({ error: error.message || 'Logout failed' }, 500);
  }
});

// Reset Password
app.post("/make-server-1f56888c/auth/reset-password", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();
    
    // Get user ID from email
    const userId = await kv.get(`email:${email.toLowerCase()}`);
    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get user data
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword);
    
    // Update user with new password
    await kv.set(`user:${userId}`, {
      ...user,
      password: hashedPassword,
    });
    
    console.log('Password reset successful for user:', userId);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Reset password error:', error);
    return c.json({ error: error.message || 'Password reset failed' }, 500);
  }
});

// Update User Profile
app.put("/make-server-1f56888c/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}`);
    
    if (!currentProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Don't allow updating email or password through this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.id;
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
    };

    await kv.set(`user:${userId}`, updatedProfile);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedProfile;

    return c.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.log('Update profile error:', error);
    return c.json({ error: error.message || 'Profile update failed' }, 500);
  }
});

// ========== PRODUCT ROUTES ==========

// Get all products for a user
app.get("/make-server-1f56888c/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const products = await kv.getByPrefix(`product:${userId}:`);
    return c.json({ success: true, products });
  } catch (error: any) {
    console.log('Get products error:', error);
    return c.json({ error: error.message || 'Failed to fetch products' }, 500);
  }
});

// Add a product
app.post("/make-server-1f56888c/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productData = await c.req.json();
    const productId = `${userId}-${Date.now()}`;
    
    const newProduct = {
      ...productData,
      id: productId,
      userId: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${userId}:${productId}`, newProduct);

    return c.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.log('Add product error:', error);
    return c.json({ error: error.message || 'Failed to add product' }, 500);
  }
});

// Update a product
app.put("/make-server-1f56888c/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    const updates = await c.req.json();
    
    const currentProduct = await kv.get(`product:${userId}:${productId}`);
    if (!currentProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updatedProduct = {
      ...currentProduct,
      ...updates,
    };

    await kv.set(`product:${userId}:${productId}`, updatedProduct);

    return c.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.log('Update product error:', error);
    return c.json({ error: error.message || 'Failed to update product' }, 500);
  }
});

// Delete a product
app.delete("/make-server-1f56888c/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    await kv.del(`product:${userId}:${productId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.log('Delete product error:', error);
    return c.json({ error: error.message || 'Failed to delete product' }, 500);
  }
});

// ========== SALES ROUTES ==========

// Get all sales for a user
app.get("/make-server-1f56888c/sales", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sales = await kv.getByPrefix(`sale:${userId}:`);
    return c.json({ success: true, sales });
  } catch (error: any) {
    console.log('Get sales error:', error);
    return c.json({ error: error.message || 'Failed to fetch sales' }, 500);
  }
});

// Add a sale
app.post("/make-server-1f56888c/sales", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const saleData = await c.req.json();
    const saleId = `${userId}-${Date.now()}`;
    
    const newSale = {
      ...saleData,
      id: saleId,
      userId: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`sale:${userId}:${saleId}`, newSale);

    // Update product stock
    for (const item of saleData.items) {
      const product = await kv.get(`product:${userId}:${item.productId}`);
      if (product) {
        const updatedStock = product.stock - item.quantity;
        await kv.set(`product:${userId}:${item.productId}`, {
          ...product,
          stock: updatedStock,
        });
      }
    }

    return c.json({ success: true, sale: newSale });
  } catch (error: any) {
    console.log('Add sale error:', error);
    return c.json({ error: error.message || 'Failed to add sale' }, 500);
  }
});

// ========== CUSTOMER ROUTES ==========

// Get all customers for a user
app.get("/make-server-1f56888c/customers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customers = await kv.getByPrefix(`customer:${userId}:`);
    return c.json({ success: true, customers });
  } catch (error: any) {
    console.log('Get customers error:', error);
    return c.json({ error: error.message || 'Failed to fetch customers' }, 500);
  }
});

// Add a customer
app.post("/make-server-1f56888c/customers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customerData = await c.req.json();
    
    // Check if customer with mobile already exists
    const existingCustomers = await kv.getByPrefix(`customer:${userId}:`);
    const exists = existingCustomers.find((c: any) => c.mobile === customerData.mobile);
    
    if (exists) {
      return c.json({ success: true, customer: exists });
    }

    const customerId = `${userId}-${Date.now()}`;
    
    const newCustomer = {
      ...customerData,
      id: customerId,
      userId: userId,
    };

    await kv.set(`customer:${userId}:${customerId}`, newCustomer);

    return c.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    console.log('Add customer error:', error);
    return c.json({ error: error.message || 'Failed to add customer' }, 500);
  }
});

// Update a customer
app.put("/make-server-1f56888c/customers/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = await getUserFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customerId = c.req.param('id');
    const updates = await c.req.json();
    
    const currentCustomer = await kv.get(`customer:${userId}:${customerId}`);
    if (!currentCustomer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    const updatedCustomer = {
      ...currentCustomer,
      ...updates,
    };

    await kv.set(`customer:${userId}:${customerId}`, updatedCustomer);

    return c.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    console.log('Update customer error:', error);
    return c.json({ error: error.message || 'Failed to update customer' }, 500);
  }
});

Deno.serve(app.fetch);