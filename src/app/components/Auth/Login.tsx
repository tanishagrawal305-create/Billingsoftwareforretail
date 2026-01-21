import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Store, LogIn, Mail, Lock, User as UserIcon, Phone, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const { login, signup, resetPassword } = useApp();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shopName: '',
    phone: '',
    address: '',
    gstNumber: '',
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginEmail, loginPassword);
    if (!success) {
      toast.error('Invalid email or password');
    } else {
      toast.success('Login successful!');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!signupData.phone || signupData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const success = signup(signupData);
    if (!success) {
      toast.error('Email already exists');
    } else {
      toast.success('Account created successfully!');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const success = resetPassword(forgotEmail, newPassword);
    if (!success) {
      toast.error('Email not found');
    } else {
      toast.success('Password reset successful!');
      setView('login');
      setForgotEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 md:w-1/2 flex flex-col justify-center items-center text-white">
            <div className="bg-white bg-opacity-20 p-6 rounded-full mb-6">
              <Store className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold mb-4">JR Invoice Maker</h1>
            <p className="text-center text-orange-100 mb-6">
              Complete Billing & Inventory Management Solution for Retail Shops
            </p>
            <div className="space-y-2 text-sm text-orange-100">
              <p>✓ Advanced Weight-Based Billing</p>
              <p>✓ GST Management</p>
              <p>✓ Inventory Tracking</p>
              <p>✓ Sales Reports & Analytics</p>
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="p-8 md:w-1/2">
            {view === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600 mb-6">Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Forgot Password?
                  </button>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView('signup')}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </>
            )}

            {view === 'signup' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600 mb-6">Start your retail journey</p>

                <form onSubmit={handleSignup} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shop Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={signupData.shopName}
                        onChange={(e) => setSignupData({ ...signupData, shopName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter shop name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shop Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={signupData.address}
                        onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter shop address"
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={signupData.gstNumber}
                        onChange={(e) => setSignupData({ ...signupData, gstNumber: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter GST number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Create Account
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView('login')}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </>
            )}

            {view === 'forgot' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
                <p className="text-gray-600 mb-6">Enter your email and new password</p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Reset Password
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView('login')}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};