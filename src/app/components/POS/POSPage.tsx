import React, { useState, useMemo, useRef } from 'react';
import { useApp, Product } from '../../contexts/AppContext';
import { Search, User, Phone, Tag, Trash2, Printer, Save, X, Plus, Minus, Grid, List } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
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
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Not enough stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error('Not enough stock');
      return;
    }

    setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscountAmount()) * 0.18;
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
        price: item.product.price,
        total: item.product.price * item.quantity,
      })),
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod,
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

    // Clear form
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
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Categories */}
      <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Categories</h3>
        </div>
        <div className="p-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
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
        {/* Header */}
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

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg h-24 mb-3 flex items-center justify-center">
                    <span className="text-3xl">🛒</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">₹{product.price}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {product.stock}
                    </span>
                  </div>
                  {product.type === 'weight' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {product.quantity} {product.unit}
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
                    <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Current Order</h2>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>

          {/* Customer Info */}
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-2">🛒</div>
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">₹{item.product.price} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-orange-600">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Discount */}
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

          {/* Totals */}
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
            <div className="flex justify-between text-gray-600">
              <span>Tax (18% GST):</span>
              <span>₹{calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-orange-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clearCart}
              className="py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Hold
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Pay ₹{calculateTotal().toFixed(2)}
            </button>
          </div>

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

      {/* Hidden Invoice */}
      {currentSale && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} sale={currentSale} shopName={user?.shopName || 'Retail Shop'} />
        </div>
      )}
    </div>
  );
};
