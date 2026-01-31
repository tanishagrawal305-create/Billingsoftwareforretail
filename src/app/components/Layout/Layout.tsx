import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Receipt,
  BarChart3,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  User,
  HelpCircle,
  Command,
  Keyboard,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CustomerSupportModal } from '../CustomerSupport/CustomerSupportModal';
import { CommandPalette } from '../QuickActions/CommandPalette';
import { KeyboardShortcutsModal } from '../QuickActions/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCustomerSupportModal, setShowCustomerSupportModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onCommandPalette: () => setShowCommandPalette(true),
  });

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/billing', icon: ShoppingCart, label: 'Billing / POS' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/inventory', icon: Warehouse, label: 'Inventory' },
    { to: '/orders', icon: Receipt, label: 'Orders' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">JR Invoice Maker</h2>
              <p className="text-xs text-gray-500">Retail POS</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.shopName}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:ml-0 ml-4">
            <h1 className="font-bold text-gray-800 text-xl">{user?.shopName}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={() => setShowCustomerSupportModal(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Customer Support Modal */}
      {showCustomerSupportModal && (
        <CustomerSupportModal
          isOpen={showCustomerSupportModal}
          onClose={() => setShowCustomerSupportModal(false)}
        />
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onShowShortcuts={() => {
            setShowCommandPalette(false);
            setShowKeyboardShortcuts(true);
          }}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {/* Unified Floating Action Button with Menu */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        {/* Floating Menu Popup */}
        {showFloatingMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-20 z-[9998]"
              onClick={() => setShowFloatingMenu(false)}
            />

            {/* Menu Items */}
            <div className="absolute bottom-20 left-0 bg-white rounded-2xl shadow-2xl p-3 space-y-2 z-[9999] min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  setShowCommandPalette(true);
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors text-left group"
              >
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Command className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-700">Quick Actions</div>
                  <div className="text-xs text-gray-500">Ctrl+K</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowKeyboardShortcuts(true);
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Keyboard className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  setShowCustomerSupportModal(true);
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-colors text-left group"
              >
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                  <HelpCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Support</span>
              </button>
            </div>
          </>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all ${
            showFloatingMenu ? 'rotate-45' : ''
          }`}
          title="Quick Actions Menu"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};