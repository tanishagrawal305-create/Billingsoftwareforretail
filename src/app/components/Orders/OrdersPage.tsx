import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { Receipt, Eye } from 'lucide-react';

export const OrdersPage = () => {
  const { sales } = useApp();

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sales]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders History</h1>
        <p className="text-gray-600 mt-1">{sales.length} total orders</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm text-gray-800">#{sale.id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {format(new Date(sale.createdAt), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {sale.customerName ? (
                      <div>
                        <p className="font-medium text-gray-800">{sale.customerName}</p>
                        {sale.customerMobile && (
                          <p className="text-sm text-gray-500">{sale.customerMobile}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Walk-in Customer</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {sale.items.length} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm uppercase">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-800">₹{sale.total.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sales.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-600">Start billing to see orders here</p>
        </div>
      )}
    </div>
  );
};
