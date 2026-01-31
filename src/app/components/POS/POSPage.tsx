import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Product } from '../../contexts/AppContext';
import { Search, User, Phone, Tag, Trash2, Printer, X, Plus, Minus, Grid, List, Home, MessageCircle, Send, HelpCircle, Menu, Command, Keyboard, MessageSquare } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { AddItemModal } from './AddItemModal';
import { CustomerSupportModal } from '../CustomerSupport/CustomerSupportModal';
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
  const navigate = useNavigate();
  const { products, addSale, addCustomer, user, updateProduct } = useApp();
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
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomerSupportModal, setShowCustomerSupportModal] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

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

  const sendBillToSMS = () => {
    if (!customerMobile) {
      toast.error('Please enter customer mobile number');
      return;
    }

    if (!currentSale) {
      toast.error('Please complete the sale first');
      return;
    }

    // Format message for SMS (without markdown formatting)
    const message = 
      `${user?.shopName || 'Invoice'}\n` +
      `Bill #${currentSale.id}\n` +
      `Date: ${new Date(currentSale.createdAt).toLocaleDateString()}\n\n` +
      `Customer: ${customerName || 'Walk-in'}\n` +
      `Mobile: ${customerMobile}\n\n` +
      `Items:\n` +
      currentSale.items.map((item: any, i: number) => 
        `${i + 1}. ${item.name}${item.customWeight ? ` - ${item.customWeight}${item.customUnit}` : ''} x${item.quantity}\n   ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}`
      ).join('\n') +
      `\n\nSubtotal: ₹${currentSale.subtotal.toFixed(2)}\n` +
      (currentSale.discount > 0 ? `Discount: -₹${currentSale.discount.toFixed(2)}\n` : '') +
      (gstEnabled && currentSale.gstAmount > 0 ? `GST: ₹${currentSale.gstAmount.toFixed(2)}\n` : '') +
      `Total: ₹${currentSale.total.toFixed(2)}\n\n` +
      `Payment: ${currentSale.paymentMethod.toUpperCase()}\n\n` +
      `Thank you for shopping with us!\n` +
      `${user?.address || ''}\n` +
      `${user?.phone || ''}`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = customerMobile.replace(/[^0-9]/g, '');
    
    // Use SMS URI scheme for mobile devices
    const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;
    
    window.location.href = smsUrl;
    toast.success('Opening SMS app to send bill');
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

    // Update stock for all products in cart
    // Group cart items by product ID and calculate total deduction per product
    const stockDeductions = new Map<string, number>();
    
    cart.forEach((cartItem) => {
      const productId = cartItem.product.id;
      let deduction = 0;
      
      if (cartItem.product.type === 'weight' && cartItem.customWeight && cartItem.customUnit) {
        // For weight-based products, convert to kg and multiply by quantity
        const weightInKg = convertToKg(cartItem.customWeight, cartItem.customUnit);
        deduction = weightInKg * cartItem.quantity;
      } else {
        // For unit-based products
        deduction = cartItem.quantity;
      }
      
      // Add to existing deduction for this product
      const currentDeduction = stockDeductions.get(productId) || 0;
      stockDeductions.set(productId, currentDeduction + deduction);
    });

    // Update stock for each product
    for (const [productId, totalDeduction] of stockDeductions.entries()) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const newStock = Math.max(0, product.stock - totalDeduction);
        await updateProduct(productId, { stock: newStock });
      }
    }

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
    setAmountReceived('');
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Unified Floating Action Button with Menu */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Floating Menu Popup */}
        {showFloatingMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-20 z-[9998]"
              onClick={() => setShowFloatingMenu(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-3 space-y-2 z-[9999] min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  navigate('/');
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-left group"
              >
                <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Home className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-700">Dashboard</span>
              </button>
              
              <button
                onClick={() => {
                  setShowCustomerSupportModal(true);
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-colors text-left group"
              >
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Support</span>
              </button>
              
              <button
                onClick={() => {
                  // Open Quick Actions (Command Palette)
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors text-left group"
              >
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Command className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-700">Quick Actions</div>
                  <div className="text-xs text-gray-500">Ctrl+K</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  // Open Keyboard Shortcuts (would need to pass this through context or similar)
                  toast.info('Press Ctrl+K and select "Keyboard Shortcuts"');
                  setShowFloatingMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Keyboard className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">Shortcuts</span>
              </button>
            </div>
          </>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all ${
            showFloatingMenu ? 'rotate-45' : ''
          }`}
          title="Quick Actions Menu"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

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
                  ? 'bg-indigo-600 text-white font-medium'
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
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
                  className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left touch-manipulation active:scale-95"
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-200 rounded-lg h-20 sm:h-24 mb-2 sm:mb-3 flex items-center justify-center">
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
                  className="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-500 hover:shadow transition-all flex items-center gap-4"
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-200 rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0">
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
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Mobile Number (for bill)"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                        <p className="text-xs text-indigo-600 font-medium mt-1">
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
                    <span className="font-bold text-indigo-600">
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
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
              <span className="text-indigo-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['cash', 'card', 'upi'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as any)}
                className={`py-2 rounded text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {method.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Pay ₹{calculateTotal().toFixed(2)}
          </button>

          {currentSale && (
            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>
              <button
                onClick={sendBillToSMS}
                disabled={!customerMobile}
                className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send to SMS
              </button>
            </div>
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

      {/* Customer Support Modal */}
      {showCustomerSupportModal && (
        <CustomerSupportModal
          isOpen={showCustomerSupportModal}
          onClose={() => setShowCustomerSupportModal(false)}
        />
      )}

      {/* Payment Modal with Change Calculator */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Complete Payment</h2>
                  <p className="text-indigo-100 text-sm mt-1">Bill Amount: ₹{calculateTotal().toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setAmountReceived('');
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-800 mb-3">Bill Summary</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                {gstEnabled && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST:</span>
                    <span>₹{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['cash', 'card', 'upi'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-3 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-indigo-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Calculator */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-lg">
                    <span className="text-white text-2xl">💰</span>
                  </div>
                  <h3 className="font-bold text-emerald-900 text-lg">Change Calculator</h3>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-emerald-800 mb-2 block">
                    Amount Received from Customer
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount received"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                    autoFocus
                  />
                </div>

                {amountReceived && parseFloat(amountReceived) > 0 && (
                  <div className="space-y-3 pt-3 border-t-2 border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-emerald-800">Bill Amount:</span>
                      <span className="text-base font-bold text-emerald-900">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-emerald-800">Amount Received:</span>
                      <span className="text-base font-bold text-emerald-900">₹{parseFloat(amountReceived).toFixed(2)}</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-2 border-emerald-400 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-emerald-800">Return Change:</span>
                        <span className={`text-3xl font-black ${
                          parseFloat(amountReceived) >= calculateTotal()
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          ₹{Math.max(0, parseFloat(amountReceived) - calculateTotal()).toFixed(2)}
                        </span>
                      </div>
                      {parseFloat(amountReceived) < calculateTotal() && (
                        <p className="text-sm text-red-600 mt-2 font-semibold flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Insufficient amount! Need ₹{(calculateTotal() - parseFloat(amountReceived)).toFixed(2)} more</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setAmountReceived('');
                  }}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleCheckout();
                    setShowPaymentModal(false);
                    setAmountReceived('');
                  }}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice */}
      {currentSale && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} sale={currentSale} user={user} />
        </div>
      )}
    </div>
  );
};