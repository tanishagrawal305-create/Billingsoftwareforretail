import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout/Layout';
import { Login } from '@/app/components/Auth/Login';
import { MasterKeyPage } from '@/app/components/Auth/MasterKeyPage';
import { Dashboard } from '@/app/components/Dashboard/Dashboard';
import { POSPage } from '@/app/components/POS/POSPage';
import { ProductsPage } from '@/app/components/Products/ProductsPage';
import { InventoryPage } from '@/app/components/Inventory/InventoryPage';
import { OrdersPage } from '@/app/components/Orders/OrdersPage';
import { ReportsPage } from '@/app/components/Reports/ReportsPage';
import { SettingsPage } from '@/app/components/Settings/SettingsPage';
import { AppProvider, useApp } from '@/app/contexts/AppContext';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

function AppRoutes() {
  const { user, loading } = useApp();
  const [isMasterUnlocked, setIsMasterUnlocked] = useState(() => {
    // Initialize from sessionStorage immediately
    return sessionStorage.getItem('jr_invoice_master_unlocked') === 'true';
  });

  // Add a way to reset for testing - Press Ctrl+Shift+R to clear session
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        sessionStorage.removeItem('jr_invoice_master_unlocked');
        setIsMasterUnlocked(false);
        console.log('Master key session cleared! Refresh page to see master key page.');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Only show master key gate if not unlocked
  if (!isMasterUnlocked) {
    return <MasterKeyPage onUnlock={() => setIsMasterUnlocked(true)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">JR Invoice Maker</h2>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/billing" element={<POSPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </Router>
    </AppProvider>
  );
}