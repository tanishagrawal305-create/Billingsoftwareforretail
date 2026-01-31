import React, { useState } from 'react';
import { Product } from '../../contexts/AppContext';
import { X, Plus, Minus } from 'lucide-react';

interface AddItemModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (item: {
    product: Product;
    price: number;
    quantity: number;
    customWeight?: number;
    customUnit?: string;
  }) => void;
}

export const AddItemModal = ({ product, onClose, onAdd }: AddItemModalProps) => {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customWeight, setCustomWeight] = useState('');
  const [customUnit, setCustomUnit] = useState(product.unit || 'kg');

  const calculateTotalPrice = () => {
    const priceNum = parseFloat(price) || 0;
    if (product.type === 'weight' && customWeight) {
      return priceNum * parseFloat(customWeight) * quantity;
    }
    return priceNum * quantity;
  };

  const handleSubmit = () => {
    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (product.type === 'weight' && (!customWeight || parseFloat(customWeight) <= 0)) {
      alert('Please enter a valid weight/volume');
      return;
    }

    const priceNum = parseFloat(price);
    const weightNum = product.type === 'weight' ? parseFloat(customWeight) : undefined;

    onAdd({
      product,
      price: product.type === 'weight' && weightNum ? priceNum * weightNum : priceNum,
      quantity,
      customWeight: weightNum,
      customUnit: product.type === 'weight' ? customUnit : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Add to Cart</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="text-xs text-gray-500 mt-1">
              Stock: {product.stock} {product.type === 'weight' ? product.unit : 'units'}
            </p>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price {product.type === 'weight' ? `(per ${product.unit})` : '(per unit)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Weight Input for weight-based products */}
          {product.type === 'weight' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight/Volume *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter weight in ${customUnit}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <div className="grid grid-cols-4 gap-2">
                  {['kg', 'g', 'ltr', 'ml'].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setCustomUnit(unit)}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        customUnit === unit
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-lg"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Price Preview */}
          {price && (product.type !== 'weight' || customWeight) && (
            <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Total Price</p>
              {product.type === 'weight' && customWeight ? (
                <p className="text-sm text-gray-700 mb-2">
                  ₹{price} × {customWeight}{customUnit} × {quantity}
                </p>
              ) : (
                <p className="text-sm text-gray-700 mb-2">
                  ₹{price} × {quantity}
                </p>
              )}
              <p className="text-2xl font-bold text-indigo-600">
                ₹{calculateTotalPrice().toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};