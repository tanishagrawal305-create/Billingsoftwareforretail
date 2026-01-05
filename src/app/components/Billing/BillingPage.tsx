import React, { useState, useRef } from 'react';
import { useApp, Product } from '../../contexts/AppContext';
import { Search, Plus, Trash2, User, Phone, CreditCard, Scan, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

export const BillingPage = () => {
  const { products, addSale, addCustomer } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paytm' | 'card'>('cash');
  const [currentSale, setCurrentSale] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Not enough stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
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
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod,
    };

    addSale(sale);

    if (customerName && customerMobile) {
      addCustomer({ name: customerName, mobile: customerMobile });
    }

    setCurrentSale({ ...sale, id: Date.now().toString(), createdAt: new Date().toISOString() });
    toast.success('Sale completed successfully!');
    
    // Clear form
    setCart([]);
    setCustomerName('');
    setCustomerMobile('');
    setSearchTerm('');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="mb-4">Products</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, category, or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                <Scan className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    product.stock <= 0
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-indigo-500 hover:shadow-md'
                  }`}
                >
                  <h4 className="mb-2 line-clamp-2">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600">₹{product.price}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.stock <= 0
                          ? 'bg-red-100 text-red-600'
                          : product.stock < 10
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {product.stock <= 0 ? 'Out' : `${product.stock}`}
                    </span>
                  </div>
                  {product.type === 'weight' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.quantity} {product.unit}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="mb-4">Cart</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">Cart is empty</div>
                <p className="text-sm text-gray-500">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">₹{item.product.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18%):</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-indigo-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="mb-4">Customer Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Customer name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Mobile (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="mb-4">Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'paytm', 'card'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`py-3 rounded-lg border-2 transition-all ${
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Complete Sale - ₹{calculateTotal().toFixed(2)}
          </button>

          {currentSale && (
            <button
              onClick={handlePrint}
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          )}
        </div>
      </div>

      {/* Hidden Invoice for Printing */}
      {currentSale && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} sale={currentSale} />
        </div>
      )}
    </div>
  );
};
