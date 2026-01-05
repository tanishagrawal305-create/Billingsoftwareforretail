import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar = () => {
  const { user, logout } = useApp();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/billing', icon: ShoppingCart, label: 'Billing' },
  ];

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-600">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-white">Retail Shop</h2>
            <p className="text-indigo-300 text-sm">Billing System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-lg'
                  : 'text-indigo-100 hover:bg-indigo-600'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-600">
        <div className="bg-indigo-600 rounded-lg p-4 mb-4">
          <p className="text-sm text-indigo-200 mb-1">Logged in as</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-indigo-300">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
