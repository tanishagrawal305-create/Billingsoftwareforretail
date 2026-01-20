import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Store, User, Mail, Building } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useApp();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Shop Name</p>
              <p className="font-medium text-gray-800">{user?.shopName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Version: 1.0.0</p>
          <p>Powered by PetPooja Style POS System</p>
          <p className="pt-4 text-xs text-gray-500">
            This is a demo application with local storage. For production use, consider integrating with a backend database.
          </p>
        </div>
      </div>
    </div>
  );
};
