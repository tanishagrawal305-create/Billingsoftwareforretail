import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, DollarSign, TrendingUp, ShoppingCart, Download, CalendarDays } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ReportsPage = () => {
  const { sales, products } = useApp();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('7');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const filteredSales = useMemo(() => {
    if (dateRange === 'custom') {
      const start = startOfDay(new Date(startDate));
      const end = endOfDay(new Date(endDate));
      return sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return isWithinInterval(saleDate, { start, end });
      });
    } else {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      return sales.filter((sale) => new Date(sale.createdAt) >= cutoffDate);
    }
  }, [sales, dateRange, startDate, endDate]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, totalDiscount, avgOrderValue };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    if (dateRange === 'custom') {
      // For custom date range, calculate day-by-day data
      const start = new Date(startDate);
      const end = new Date(endDate);
      const data = [];
      
      // Calculate number of days in range
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const daySales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= dayStart && saleDate <= dayEnd;
        });
        
        const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
        data.push({
          date: format(date, 'dd MMM'),
          revenue,
          orders: daySales.length,
        });
      }
      
      return data;
    } else {
      // For preset ranges (7, 30, 90 days)
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
    }
  }, [filteredSales, dateRange, startDate, endDate]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your business performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm touch-manipulation ${
                dateRange === days
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Last {days} Days
            </button>
          ))}
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm touch-manipulation flex items-center gap-2 ${
              dateRange === 'custom'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {dateRange === 'custom' && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 sm:p-6 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-800 text-lg">Select Custom Date Range</h3>
          </div>
          
          {/* Quick Presets */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStartDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
                setEndDate(format(new Date(), 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-orange-50 border border-orange-300 rounded-lg transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => {
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
                setEndDate(format(new Date(), 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-orange-50 border border-orange-300 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                setStartDate(format(firstDay, 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-orange-50 border border-orange-300 rounded-lg transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                setStartDate(format(lastMonth, 'yyyy-MM-dd'));
                setEndDate(format(lastMonthEnd, 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-orange-50 border border-orange-300 rounded-lg transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), 0, 1);
                setStartDate(format(firstDay, 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-orange-50 border border-orange-300 rounded-lg transition-colors"
            >
              This Year
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800 font-medium"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-700 bg-white bg-opacity-60 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="flex-1">
              Showing data from <strong>{format(new Date(startDate), 'dd MMM yyyy')}</strong> to <strong>{format(new Date(endDate), 'dd MMM yyyy')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{(stats.totalRevenue || 0).toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{(stats.avgOrderValue || 0).toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Total Discount</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">₹{(stats.totalDiscount || 0).toFixed(2)}</h2>
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