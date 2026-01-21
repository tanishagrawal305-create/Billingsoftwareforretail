import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { Receipt, Eye, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export const OrdersPage = () => {
  const { sales } = useApp();

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sales]);

  const generatePDF = (sale: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('JR Invoice Maker', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Order Receipt', 105, 25, { align: 'center' });
    
    // Order Details
    doc.setFontSize(12);
    doc.text(`Order ID: #${sale.id.slice(-6)}`, 20, 40);
    doc.text(`Date: ${format(new Date(sale.date || sale.createdAt), 'dd MMM yyyy, HH:mm')}`, 20, 48);
    doc.text(`Customer: ${sale.customer?.name || sale.customerName || 'Walk-in Customer'}`, 20, 56);
    if (sale.customer?.mobile || sale.customerMobile) {
      doc.text(`Mobile: ${sale.customer?.mobile || sale.customerMobile}`, 20, 64);
    }
    doc.text(`Payment: ${sale.paymentMethod?.toUpperCase()}`, 20, 72);
    
    // Items Table Header
    doc.setFontSize(10);
    let yPos = 85;
    doc.text('Item', 20, yPos);
    doc.text('Unit', 110, yPos);
    doc.text('Price', 140, yPos);
    doc.text('Amount', 170, yPos);
    
    // Line under header
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    // Items
    sale.items.forEach((item: any) => {
      const itemName = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
      
      // Determine the unit display based on item type
      let unitStr = '';
      if (item.type === 'weight') {
        // For weight-based items, show the weight with unit
        if (item.customWeight) {
          unitStr = `${item.customWeight}${item.customUnit || item.unit || 'kg'}`;
        } else {
          // Fallback to quantity with unit
          unitStr = `${item.quantity}${item.unit || 'kg'}`;
        }
      } else {
        // For unit-based items, show quantity with 'u'
        unitStr = `${item.quantity}u`;
      }
      
      const priceStr = `₹${item.price.toFixed(2)}`;
      const amountStr = `₹${(item.price * item.quantity).toFixed(2)}`;
      
      doc.text(itemName, 20, yPos);
      doc.text(unitStr, 110, yPos);
      doc.text(priceStr, 140, yPos);
      doc.text(amountStr, 170, yPos);
      yPos += 8;
      
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Summary
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(`Subtotal:`, 130, yPos);
    doc.text(`₹${sale.subtotal.toFixed(2)}`, 170, yPos);
    yPos += 8;
    
    if (sale.applyGst) {
      doc.text(`GST:`, 130, yPos);
      doc.text(`₹${sale.gstAmount.toFixed(2)}`, 170, yPos);
      yPos += 8;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total:`, 130, yPos);
    doc.text(`₹${sale.total.toFixed(2)}`, 170, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    
    // Save
    doc.save(`Invoice_${sale.id.slice(-6)}.pdf`);
  };

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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
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
                    <span className="font-bold text-gray-800">₹{(sale.total || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => generatePDF(sale)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">PDF</span>
                    </button>
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