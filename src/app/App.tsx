import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductManagement } from './components/Products/ProductManagement';
import { BillingPage } from './components/Billing/BillingPage';
import { Sidebar } from './components/Layout/Sidebar';
import { Toaster } from 'sonner';

const AuthWrapper = () => {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <LoginPage onSwitchToSignup={() => setShowLogin(false)} />
  ) : (
    <SignupPage onSwitchToLogin={() => setShowLogin(true)} />
  );
};

const AppContent = () => {
  const { user } = useApp();

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </AppProvider>
    </BrowserRouter>
  );
}
