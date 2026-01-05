import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const Dashboard = () => {
  const { sales, products } = useApp();
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredSales = useMemo(() => {
    const now = selectedDate;
    let start: Date, end: Date;

    switch (period) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'weekly':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'yearly':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
    }

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, period, selectedDate]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;
    const totalProducts = products.length;

    return { totalRevenue, totalOrders, lowStockProducts, totalProducts };
  }, [filteredSales, products]);

  const chartData = useMemo(() => {
    if (period === 'daily') {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map((hour) => {
        const hourSales = filteredSales.filter((sale) => {
          const saleHour = new Date(sale.createdAt).getHours();
          return saleHour === hour;
        });
        const revenue = hourSales.reduce((sum, sale) => sum + sale.total, 0);
        return {
          name: `${hour}:00`,
          revenue,
          orders: hourSales.length,
        };
      });
    } else if (period === 'weekly') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek(selectedDate));
        date.setDate(date.getDate() + i);
        return date;
      });
      return days.map((day) => {
        const daySales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return format(saleDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
        return {
          name: format(day, 'EEE'),
          revenue,
          orders: daySales.length,
        };
      });
    } else if (period === 'monthly') {
      const daysInMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      ).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      return days.map((day) => {
        const daySales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.getDate() === day;
        });
        const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
        return {
          name: `Day ${day}`,
          revenue,
          orders: daySales.length,
        };
      }).filter((_, i) => i % 2 === 0); // Show every other day for readability
    } else {
      const months = Array.from({ length: 12 }, (_, i) => i);
      return months.map((month) => {
        const monthSales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.getMonth() === month;
        });
        const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
        return {
          name: format(new Date(2024, month), 'MMM'),
          revenue,
          orders: monthSales.length,
        };
      });
    }
  }, [filteredSales, period, selectedDate]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1>Sales Dashboard</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as PeriodType)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <h2 className="mt-2">₹{stats.totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <h2 className="mt-2">{stats.totalOrders}</h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <h2 className="mt-2">{stats.totalProducts}</h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Alert</p>
              <h2 className="mt-2">{stats.lowStockProducts}</h2>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="mb-4">Orders Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Payment</th>
                <th className="text-right py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="py-3 px-4">
                    {sale.customerName || 'Walk-in Customer'}
                  </td>
                  <td className="py-3 px-4">{sale.items.length}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-sm">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">₹{sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
