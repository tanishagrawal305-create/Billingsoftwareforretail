import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase clients
const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getAnonSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

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

// ========== AUTHENTICATION ROUTES ==========

// Signup
app.post("/make-server-1f56888c/auth/signup", async (c) => {
  try {
    const { email, password, name, shopName, phone, address, gstNumber } = await c.req.json();
    
    const supabase = getSupabaseClient();
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, shopName, phone, address, gstNumber },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });

    if (authError) {
      console.log('Signup auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV store
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      shopName,
      phone,
      address,
      gstNumber: gstNumber || '',
      shopLogo: '',
      taxRate: 5,
      createdAt: new Date().toISOString(),
    });

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

    for (const product of sampleProducts) {
      await kv.set(`product:${userId}:${product.id}`, product);
    }

    return c.json({ 
      success: true, 
      user: { id: userId, email, name, shopName, phone, address, gstNumber, shopLogo: '', taxRate: 5 }
    });
  } catch (error: any) {
    console.log('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// Login
app.post("/make-server-1f56888c/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = getAnonSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login auth error:', error);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${data.user.id}`);
    
    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: userProfile
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    return c.json({ success: true, user: userProfile });
  } catch (error: any) {
    console.log('Session error:', error);
    return c.json({ error: error.message || 'Session check failed' }, 500);
  }
});

// Logout
app.post("/make-server-1f56888c/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getAnonSupabaseClient();
    await supabase.auth.signOut();

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
    
    const supabase = getSupabaseClient();
    
    // Get user by email
    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
    if (getUserError) {
      return c.json({ error: getUserError.message }, 400);
    }

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      return c.json({ error: updateError.message }, 400);
    }

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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ success: true, user: updatedProfile });
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const products = await kv.getByPrefix(`product:${user.id}:`);
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productData = await c.req.json();
    const productId = `${user.id}-${Date.now()}`;
    
    const newProduct = {
      ...productData,
      id: productId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${user.id}:${productId}`, newProduct);

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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    const updates = await c.req.json();
    
    const currentProduct = await kv.get(`product:${user.id}:${productId}`);
    if (!currentProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updatedProduct = {
      ...currentProduct,
      ...updates,
    };

    await kv.set(`product:${user.id}:${productId}`, updatedProduct);

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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    await kv.del(`product:${user.id}:${productId}`);

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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sales = await kv.getByPrefix(`sale:${user.id}:`);
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const saleData = await c.req.json();
    const saleId = `${user.id}-${Date.now()}`;
    
    const newSale = {
      ...saleData,
      id: saleId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`sale:${user.id}:${saleId}`, newSale);

    // Update product stock
    for (const item of saleData.items) {
      const product = await kv.get(`product:${user.id}:${item.productId}`);
      if (product) {
        const updatedStock = product.stock - item.quantity;
        await kv.set(`product:${user.id}:${item.productId}`, {
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customers = await kv.getByPrefix(`customer:${user.id}:`);
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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customerData = await c.req.json();
    
    // Check if customer with mobile already exists
    const existingCustomers = await kv.getByPrefix(`customer:${user.id}:`);
    const exists = existingCustomers.find((c: any) => c.mobile === customerData.mobile);
    
    if (exists) {
      return c.json({ success: true, customer: exists });
    }

    const customerId = `${user.id}-${Date.now()}`;
    
    const newCustomer = {
      ...customerData,
      id: customerId,
      userId: user.id,
    };

    await kv.set(`customer:${user.id}:${customerId}`, newCustomer);

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

    const supabase = getAnonSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const customerId = c.req.param('id');
    const updates = await c.req.json();
    
    const currentCustomer = await kv.get(`customer:${user.id}:${customerId}`);
    if (!currentCustomer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    const updatedCustomer = {
      ...currentCustomer,
      ...updates,
    };

    await kv.set(`customer:${user.id}:${customerId}`, updatedCustomer);

    return c.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    console.log('Update customer error:', error);
    return c.json({ error: error.message || 'Failed to update customer' }, 500);
  }
});

Deno.serve(app.fetch);