import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Store, User, Mail, Building, Phone, MapPin, FileText, Save, Edit2, Percent } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { user, updateProfile, products, sales, customers } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    shopName: user?.shopName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gstNumber: user?.gstNumber || '',
    taxRate: user?.taxRate || 5,
  });

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      toast.success('Settings updated successfully');
    } else {
      toast.error('Failed to update settings');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      shopName: user?.shopName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      gstNumber: user?.gstNumber || '',
      taxRate: user?.taxRate || 5,
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Settings
          </button>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Account Information</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Owner Name
              </div>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </div>
            </label>
            <p className="text-gray-800 font-medium">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400" />
                Shop Name
              </div>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.shopName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Phone Number
              </div>
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.phone || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Shop Address
              </div>
            </label>
            {isEditing ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.address || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                GST Number
              </div>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter GST Number (optional)"
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.gstNumber || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-400" />
                Default Tax Rate (%)
              </div>
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{user?.taxRate}%</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Business Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Business Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-orange-600">
              {products.length}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-blue-600">
              {sales.length}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.length}
            </p>
          </div>
        </div>
      </div>

      {/* App Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">POS Billing</p>
                <p className="text-sm text-gray-500">Advanced billing with weight support</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">GST Management</p>
                <p className="text-sm text-gray-500">Enable/disable GST per customer</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Inventory Management</p>
                <p className="text-sm text-gray-500">Track stock and manage products</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center justify-between">
            <span>Version:</span>
            <span className="font-medium text-gray-800">2.0.0</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Platform:</span>
            <span className="font-medium text-gray-800">JR Invoice Maker</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Data Storage:</span>
            <span className="font-medium text-gray-800">Cloud Database</span>
          </p>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> This application uses a secure cloud database with backend API. 
              All your data (users, products, sales, customers) is securely stored in the cloud and 
              accessible from any device when you log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};