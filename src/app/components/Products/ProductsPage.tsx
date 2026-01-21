import React, { useState, useMemo } from 'react';
import { useApp, Product } from '../../contexts/AppContext';
import { Plus, Search, Edit, Trash2, Grid, List, Filter } from 'lucide-react';
import { AddProductModal } from './AddProductModal';

export const ProductsPage = () => {
  const { products, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 h-32 flex items-center justify-center">
                <span className="text-5xl">🛒</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-600'
                        : product.stock < 10
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {product.stock} {product.type === 'weight' ? 'kg' : 'units'}
                  </span>
                </div>
                {product.type === 'weight' && (
                  <p className="text-sm text-gray-500 mb-3">
                    Unit: {product.unit}
                  </p>
                )}
                {product.barcode && (
                  <p className="text-xs text-gray-400 mb-3">Barcode: {product.barcode}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      {product.barcode && (
                        <p className="text-sm text-gray-500">{product.barcode}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{product.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : product.stock < 10
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {product.stock} {product.type === 'weight' ? 'kg' : 'units'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {product.type === 'weight'
                      ? `Weight (${product.unit})`
                      : 'Unit Based'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AddProductModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};