import React, { useState } from 'react';
import { Product } from '../../contexts/AppContext';
import { X, Scale } from 'lucide-react';

interface WeightModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, weight: number, unit: string) => void;
}

export const WeightModal = ({ product, onClose, onAdd }: WeightModalProps) => {
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<string>(product.unit || 'kg');

  // Quick weight buttons based on product unit
  const quickWeights = product.unit === 'kg' || product.unit === 'ltr'
    ? [0.25, 0.5, 1, 2, 5]
    : [50, 100, 250, 500, 1000];

  const calculatePrice = () => {
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) return 0;

    let weightInKg = weightValue;
    if (unit === 'g' || unit === 'ml') {
      weightInKg = weightValue / 1000;
    }

    return weightInKg * product.price;
  };

  const handleAdd = () => {
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      return;
    }

    onAdd(product, weightValue, unit);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <p className="text-sm opacity-90">₹{product.price} per {product.unit}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Weight/Volume
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                {(product.unit === 'kg' || product.unit === 'g') && (
                  <>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </>
                )}
                {(product.unit === 'ltr' || product.unit === 'ml') && (
                  <>
                    <option value="ltr">ltr</option>
                    <option value="ml">ml</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Quick Weights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickWeights.map((qty) => (
                <button
                  key={qty}
                  onClick={() => {
                    setWeight(qty.toString());
                    setUnit(product.unit === 'kg' || product.unit === 'ltr' ? product.unit! : unit);
                  }}
                  className="py-2 px-3 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors font-medium text-sm"
                >
                  {qty}
                  {product.unit === 'kg' || product.unit === 'ltr' ? product.unit : 'g'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Price Calculation:</span>
              <span className="text-sm text-gray-500">
                {weight || '0'} {unit} × ₹{product.price}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Total Price:</span>
              <span className="text-2xl font-bold text-orange-600">
                ₹{calculatePrice().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!weight || parseFloat(weight) <= 0}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Add to Cart
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: You can add the same product multiple times with different weights
          </p>
        </div>
      </div>
    </div>
  );
};
