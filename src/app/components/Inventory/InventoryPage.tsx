import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Package, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export const InventoryPage = () => {
  const { products } = useApp();

  const inventoryStats = useMemo(() => {
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10);
    const outOfStock = products.filter((p) => p.stock === 0);
    const inStock = products.filter((p) => p.stock >= 10);
    
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return { lowStock, outOfStock, inStock, totalValue };
  }, [products]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage your stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{inventoryStats.totalValue.toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{inventoryStats.inStock.length}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{inventoryStats.lowStock.length}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{inventoryStats.outOfStock.length}</h2>
        </div>
      </div>

      {/* Low Stock Items */}
      {inventoryStats.lowStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            Low Stock Alert
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryStats.lowStock.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-orange-600">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className="text-yellow-600 text-sm">⚠️ Low Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Out of Stock Items */}
      {inventoryStats.outOfStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Out of Stock
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryStats.outOfStock.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className="text-red-600 text-sm">🔴 Out of Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
