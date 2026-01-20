import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, DollarSign, TrendingUp, ShoppingCart, Download } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ReportsPage = () => {
  const { sales, products } = useApp();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');

  const filteredSales = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return sales.filter((sale) => new Date(sale.createdAt) >= cutoffDate);
  }, [sales, dateRange]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, totalDiscount, avgOrderValue };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      const daySales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= start && saleDate <= end;
      });
      const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
      data.push({
        date: format(date, 'dd MMM'),
        revenue,
        orders: daySales.length,
      });
    }
    return data;
  }, [filteredSales, dateRange]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your business performance</p>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === days
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{stats.avgOrderValue.toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Total Discount</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{stats.totalDiscount.toFixed(2)}</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
