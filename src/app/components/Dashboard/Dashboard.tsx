import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const Dashboard = () => {
  const { sales, products } = useApp();
  const navigate = useNavigate();

  // Today's sales
  const todaySales = useMemo(() => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales]);

  // Yesterday's sales
  const yesterdaySales = useMemo(() => {
    const yesterday = subDays(new Date(), 1);
    const start = startOfDay(yesterday);
    const end = endOfDay(yesterday);
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales]);

  // Stats
  const stats = useMemo(() => {
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

    const todayOrders = todaySales.length;
    const yesterdayOrders = yesterdaySales.length;
    const ordersChange = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;

    return {
      todayRevenue,
      revenueChange,
      todayOrders,
      ordersChange,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [todaySales, yesterdaySales, products]);

  // Last 7 days data
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= start && saleDate <= end;
      });
      const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
      data.push({
        date: format(date, 'EEE'),
        revenue,
        orders: daySales.length,
      });
    }
    return data;
  }, [sales]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productSales.get(item.productId) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          name: item.productName,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total,
        });
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Payment method distribution
  const paymentData = useMemo(() => {
    const methods = { cash: 0, card: 0, upi: 0 };
    todaySales.forEach((sale) => {
      methods[sale.paymentMethod]++;
    });
    return [
      { name: 'Cash', value: methods.cash, color: '#10b981' },
      { name: 'Card', value: methods.card, color: '#3b82f6' },
      { name: 'UPI', value: methods.upi, color: '#f59e0b' },
    ];
  }, [todaySales]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenueChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.revenueChange || 0).toFixed(1)}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
          <h2 className="text-2xl font-bold text-gray-800">₹{(stats.todayRevenue || 0).toFixed(2)}</h2>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.ordersChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.ordersChange || 0).toFixed(1)}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Orders</p>
          <h2 className="text-2xl font-bold text-gray-800">{stats.todayOrders || 0}</h2>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Click to view all orders →</p>
        </button>

        <button
          onClick={() => navigate('/products')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <h2 className="text-2xl font-bold text-gray-800">{stats.totalProducts || 0}</h2>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Click to manage products →</p>
        </button>

        <button
          onClick={() => navigate('/inventory')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-300 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Low Stock Alert</p>
          <h2 className="text-2xl font-bold text-gray-800">{stats.lowStockProducts || 0}</h2>
          {stats.outOfStockProducts > 0 && (
            <p className="text-sm text-red-600 mt-1">{stats.outOfStockProducts} out of stock</p>
          )}
          <p className="text-xs text-red-600 mt-2 font-medium">Click to check inventory →</p>
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Orders Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{(product.revenue || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Today's Payment Methods</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentData.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: method.color }}
                  />
                  <span className="text-sm text-gray-700">{method.name}</span>
                </div>
                <span className="font-medium text-gray-800">{method.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};