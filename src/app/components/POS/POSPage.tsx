import React, { useState, useMemo, useRef } from 'react';
import { useApp, Product } from '../../contexts/AppContext';
import { Search, User, Phone, Tag, Trash2, Printer, X, Plus, Minus, Grid, List, Edit2, Check } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customWeight?: number;
  customUnit?: string;
  calculatedPrice: number;
}

export const POSPage = () => {
  const { products, addSale, addCustomer, user } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Weight input modal
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customWeight, setCustomWeight] = useState('');
  const [customUnit, setCustomUnit] = useState('kg');
  const [itemQuantity, setItemQuantity] = useState(1);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm);
      return matchesCategory && matchesSearch && p.stock > 0;
    });
  }, [products, selectedCategory, searchTerm]);

  const convertToKg = (weight: number, unit: string): number => {
    switch (unit) {
      case 'g':
        return weight / 1000;
      case 'ltr':
        return weight;
      case 'ml':
        return weight / 1000;
      case 'kg':
      default:
        return weight;
    }
  };

  const calculatePriceForWeight = (product: Product, weight: number, unit: string): number => {
    const weightInKg = convertToKg(weight, unit);
    return product.price * weightInKg;
  };

  const addToCart = (product: Product) => {
    if (product.type === 'weight') {
      setSelectedProduct(product);
      setCustomWeight('');
      setCustomUnit(product.unit || 'kg');
      setItemQuantity(1);
      setShowWeightModal(true);
    } else {
      // Unit-based product - Check stock availability
      const existingItem = cart.find((item) => item.product.id === product.id);
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const totalQuantityNeeded = currentQuantityInCart + 1;

      if (totalQuantityNeeded > product.stock) {
        toast.error(`Insufficient stock! Only ${product.stock} units available (${currentQuantityInCart} already in cart)`);
        return;
      }

      // Add to cart
      if (existingItem) {
        setCart(cart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        const newItem: CartItem = {
          id: Date.now().toString(),
          product,
          quantity: 1,
          calculatedPrice: product.price,
        };
        setCart([...cart, newItem]);
      }
      toast.success('Item added to cart');
    }
  };

  const addWeightBasedItem = () => {
    if (!selectedProduct || !customWeight) {
      toast.error('Please enter weight');
      return;
    }

    const weight = parseFloat(customWeight);
    if (weight <= 0) {
      toast.error('Please enter valid weight');
      return;
    }

    // Check stock availability for weight-based products
    const weightInKg = convertToKg(weight, customUnit);
    const totalWeightNeeded = weightInKg * itemQuantity;

    // Calculate existing weight in cart for this product
    const existingWeightInCart = cart
      .filter((item) => item.product.id === selectedProduct.id)
      .reduce((sum, item) => {
        if (item.customWeight && item.customUnit) {
          const itemWeightInKg = convertToKg(item.customWeight, item.customUnit);
          return sum + itemWeightInKg * item.quantity;
        }
        return sum;
      }, 0);

    const totalWeightRequired = existingWeightInCart + totalWeightNeeded;

    if (totalWeightRequired > selectedProduct.stock) {
      const availableWeight = selectedProduct.stock - existingWeightInCart;
      toast.error(
        `Insufficient stock! Only ${selectedProduct.stock} kg available. ${existingWeightInCart.toFixed(2)} kg already in cart. You can add ${availableWeight.toFixed(2)} kg more.`
      );
      return;
    }

    const pricePerItem = calculatePriceForWeight(selectedProduct, weight, customUnit);
    
    const newItem: CartItem = {
      id: Date.now().toString(),
      product: selectedProduct,
      quantity: itemQuantity,
      customWeight: weight,
      customUnit: customUnit,
      calculatedPrice: pricePerItem,
    };

    setCart([...cart, newItem]);
    setShowWeightModal(false);
    toast.success('Item added to cart');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    // Stock validation
    if (item.product.type === 'weight') {
      // For weight-based products
      if (item.customWeight && item.customUnit) {
        const itemWeightInKg = convertToKg(item.customWeight, item.customUnit);
        const newTotalWeight = itemWeightInKg * quantity;

        // Calculate other items' weight for the same product
        const otherItemsWeight = cart
          .filter((i) => i.product.id === item.product.id && i.id !== itemId)
          .reduce((sum, i) => {
            if (i.customWeight && i.customUnit) {
              const w = convertToKg(i.customWeight, i.customUnit);
              return sum + w * i.quantity;
            }
            return sum;
          }, 0);

        const totalWeightRequired = otherItemsWeight + newTotalWeight;

        if (totalWeightRequired > item.product.stock) {
          toast.error(
            `Insufficient stock! Only ${item.product.stock} kg available. Currently using ${totalWeightRequired.toFixed(2)} kg.`
          );
          return;
        }
      }
    } else {
      // For unit-based products
      const otherItemsQuantity = cart
        .filter((i) => i.product.id === item.product.id && i.id !== itemId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const totalQuantityRequired = otherItemsQuantity + quantity;

      if (totalQuantityRequired > item.product.stock) {
        toast.error(
          `Insufficient stock! Only ${item.product.stock} units available (${otherItemsQuantity} already in other cart items).`
        );
        return;
      }
    }

    setCart(cart.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTax = () => {
    if (!gstEnabled) return 0;
    const taxableAmount = calculateSubtotal() - calculateDiscountAmount();
    
    // Calculate weighted GST based on items
    let totalTax = 0;
    cart.forEach((item) => {
      const itemTotal = item.calculatedPrice * item.quantity;
      const itemAfterDiscount = itemTotal - (itemTotal * discount / 100);
      const gstRate = item.product.gstRate || 0;
      const itemTax = (itemAfterDiscount * gstRate) / 100;
      totalTax += itemTax;
    });
    
    return totalTax || 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount() + calculateTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const sale = {
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.calculatedPrice,
        total: item.calculatedPrice * item.quantity,
        weight: item.customWeight,
        unit: item.customUnit,
      })),
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod,
      gstEnabled,
    };

    addSale(sale);

    if (customerName && customerMobile) {
      addCustomer({ name: customerName, mobile: customerMobile });
    }

    setCurrentSale({
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });

    toast.success('Sale completed successfully!');

    setCart([]);
    setCustomerName('');
    setCustomerMobile('');
    setDiscount(0);
    setSearchTerm('');
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar - Categories */}
      <div className="hidden sm:block w-40 lg:w-48 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Categories</h3>
        </div>
        <div className="p-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-lg mb-1 transition-colors text-sm lg:text-base touch-manipulation ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Center - Products */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left touch-manipulation active:scale-95"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg h-20 sm:h-24 mb-2 sm:mb-3 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🛒</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1 line-clamp-2 text-sm sm:text-base">{product.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-orange-600">₹{product.price}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {product.stock}
                    </span>
                  </div>
                  {product.type === 'weight' && (
                    <p className="text-xs text-gray-400 mt-1">
                      per {product.unit}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-500 hover:shadow transition-all flex items-center gap-4"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">₹{product.price}</div>
                    <div className="text-xs text-gray-500">
                      {product.type === 'weight' ? `per ${product.unit}` : 'per unit'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-full sm:w-80 md:w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-bold text-gray-800 text-base sm:text-lg">Current Order</h2>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm touch-manipulation"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-2">🛒</div>
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">
                        ₹{(item.calculatedPrice || 0).toFixed(2)} each
                      </p>
                      {item.customWeight && (
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          {item.customWeight} {item.customUnit}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-orange-600">
                      ₹{((item.calculatedPrice || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              placeholder="Discount %"
              value={discount || ''}
              onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">GST Enabled</span>
            <button
              onClick={() => setGstEnabled(!gstEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                gstEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  gstEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount}%):</span>
                <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
              </div>
            )}
            {gstEnabled && (
              <div className="flex justify-between text-gray-600">
                <span>GST:</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-orange-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['cash', 'card', 'upi'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as any)}
                className={`py-2 rounded text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {method.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Pay ₹{calculateTotal().toFixed(2)}
          </button>

          {currentSale && (
            <button
              onClick={handlePrint}
              className="w-full py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Bill
            </button>
          )}
        </div>
      </div>

      {/* Weight Input Modal */}
      {showWeightModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Enter Weight/Volume</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Product</p>
                <p className="font-semibold text-gray-800">{selectedProduct.name}</p>
                <p className="text-sm text-orange-600">₹{selectedProduct.price} per {selectedProduct.unit}</p>
              </div>

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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Enter weight in ${customUnit}`}
                  autoFocus
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
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {customWeight && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Price Calculation</p>
                  <p className="text-lg font-bold text-orange-600">
                    ₹{calculatePriceForWeight(selectedProduct, parseFloat(customWeight), customUnit).toFixed(2)} × {itemQuantity} = 
                    ₹{(calculatePriceForWeight(selectedProduct, parseFloat(customWeight), customUnit) * itemQuantity).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addWeightBasedItem}
                className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice */}
      {currentSale && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} sale={currentSale} shopName={user?.shopName || 'Retail Shop'} />
        </div>
      )}
    </div>
  );
};