import React, { useState, useMemo, useRef } from 'react';
import { useApp, Product } from '../../contexts/AppContext';
import { Search, User, Phone, Tag, Trash2, Printer, X, Plus, Minus, Grid, List } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { AddItemModal } from './AddItemModal';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
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

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const openAddItemModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAddItemModal(true);
  };

  const addItemToCart = (item: {
    product: Product;
    price: number;
    quantity: number;
    customWeight?: number;
    customUnit?: string;
  }) => {
    // Stock validation
    if (item.product.type === 'weight' && item.customWeight && item.customUnit) {
      const weightInKg = convertToKg(item.customWeight, item.customUnit);
      const totalWeightNeeded = weightInKg * item.quantity;

      const existingWeightInCart = cart
        .filter((cartItem) => cartItem.product.id === item.product.id)
        .reduce((sum, cartItem) => {
          if (cartItem.customWeight && cartItem.customUnit) {
            const itemWeightInKg = convertToKg(cartItem.customWeight, cartItem.customUnit);
            return sum + itemWeightInKg * cartItem.quantity;
          }
          return sum;
        }, 0);

      const totalWeightRequired = existingWeightInCart + totalWeightNeeded;

      if (totalWeightRequired > item.product.stock) {
        const availableWeight = item.product.stock - existingWeightInCart;
        toast.error(
          `Insufficient stock! Only ${item.product.stock} kg available. ${existingWeightInCart.toFixed(2)} kg already in cart. You can add ${availableWeight.toFixed(2)} kg more.`
        );
        return;
      }
    } else {
      // Unit-based product
      const currentQuantityInCart = cart
        .filter((cartItem) => cartItem.product.id === item.product.id)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      const totalQuantityNeeded = currentQuantityInCart + item.quantity;

      if (totalQuantityNeeded > item.product.stock) {
        toast.error(
          `Insufficient stock! Only ${item.product.stock} units available (${currentQuantityInCart} already in cart)`
        );
        return;
      }
    }

    const newItem: CartItem = {
      id: Date.now().toString(),
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      customWeight: item.customWeight,
      customUnit: item.customUnit,
      calculatedPrice: item.price,
    };

    setCart([...cart, newItem]);
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
      if (item.customWeight && item.customUnit) {
        const itemWeightInKg = convertToKg(item.customWeight, item.customUnit);
        const newTotalWeight = itemWeightInKg * quantity;

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
            `Insufficient stock! Only ${item.product.stock} kg available.`
          );
          return;
        }
      }
    } else {
      const otherItemsQuantity = cart
        .filter((i) => i.product.id === item.product.id && i.id !== itemId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const totalQuantityRequired = otherItemsQuantity + quantity;

      if (totalQuantityRequired > item.product.stock) {
        toast.error(
          `Insufficient stock! Only ${item.product.stock} units available.`
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const sale = {
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.calculatedPrice,
        total: item.calculatedPrice * item.quantity,
        type: item.product.type,
        customWeight: item.customWeight,
        customUnit: item.customUnit,
        gstRate: item.product.gstRate,
      })),
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      gstAmount: calculateTax(),
      total: calculateTotal(),
      paymentMethod,
      applyGst: gstEnabled,
      createdAt: new Date().toISOString(),
    };

    await addSale(sale);

    if (customerName && customerMobile) {
      await addCustomer({ name: customerName, mobile: customerMobile });
    }

    // Update stock
    const updatedProducts = products.map((p) => {
      const soldItem = cart.find((item) => item.product.id === p.id);
      if (soldItem) {
        if (soldItem.product.type === 'weight' && soldItem.customWeight && soldItem.customUnit) {
          const weightInKg = convertToKg(soldItem.customWeight, soldItem.customUnit);
          return { ...p, stock: p.stock - (weightInKg * soldItem.quantity) };
        } else {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
      }
      return p;
    });

    setCurrentSale({
      ...sale,
      id: Date.now().toString(),
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
                  onClick={() => openAddItemModal(product)}
                  className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left touch-manipulation active:scale-95"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg h-20 sm:h-24 mb-2 sm:mb-3 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🛒</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1 line-clamp-2 text-sm sm:text-base">{product.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {product.stock} {product.type === 'weight' ? product.unit : 'units'}
                    </span>
                  </div>
                  {product.type === 'weight' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Weight-based ({product.unit})
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
                  onClick={() => openAddItemModal(product)}
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
                    <div className="text-sm font-semibold text-green-600">
                      {product.stock} {product.type === 'weight' ? product.unit : 'units'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.type === 'weight' ? `Weight-based` : 'Unit-based'}
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

      {/* Add Item Modal */}
      {showAddItemModal && selectedProduct && (
        <AddItemModal
          product={selectedProduct}
          onClose={() => {
            setShowAddItemModal(false);
            setSelectedProduct(null);
          }}
          onAdd={addItemToCart}
        />
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
