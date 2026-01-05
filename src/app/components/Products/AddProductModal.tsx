import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X } from 'lucide-react';

interface AddProductModalProps {
  productId?: string | null;
  onClose: () => void;
}

export const AddProductModal = ({ productId, onClose }: AddProductModalProps) => {
  const { products, addProduct, updateProduct } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    type: 'unit' as 'unit' | 'weight',
    unit: 'kg',
    quantity: '',
    stock: '',
    barcode: '',
  });

  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          price: product.price.toString(),
          type: product.type,
          unit: product.unit || 'kg',
          quantity: product.quantity?.toString() || '',
          stock: product.stock.toString(),
          barcode: product.barcode || '',
        });
      }
    }
  }, [productId, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      type: formData.type,
      unit: formData.type === 'weight' ? formData.unit : undefined,
      quantity: formData.type === 'weight' ? parseFloat(formData.quantity) : undefined,
      stock: parseInt(formData.stock),
      barcode: formData.barcode || undefined,
    };

    if (productId) {
      updateProduct(productId, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2>{productId ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Grocery, Electronics"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Price *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Available stock"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Product Type *</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'unit' | 'weight' })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="unit">Unit Based</option>
                <option value="weight">Weight Based</option>
              </select>
            </div>

            {formData.type === 'weight' && (
              <>
                <div>
                  <label className="block text-sm mb-2">Weight/Volume *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="ltr">Liter (ltr)</option>
                    <option value="ml">Milliliter (ml)</option>
                  </select>
                </div>
              </>
            )}

            <div className={formData.type === 'unit' ? 'md:col-span-2' : ''}>
              <label className="block text-sm mb-2">Barcode (Optional)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Scan or enter barcode"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {productId ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
