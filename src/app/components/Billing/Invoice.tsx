import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoiceProps {
  sale: any;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ sale }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="border-b-4 border-indigo-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              Retail Shop
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>123 Business Street</p>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>City, State 12345</p>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>Phone: +91 1234567890</p>
            <p style={{ color: '#6b7280' }}>Email: shop@example.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#4f46e5' }}>
              INVOICE
            </h2>
            <p style={{ marginBottom: '4px' }}>
              <strong>Invoice #:</strong> {sale.id}
            </p>
            <p>
              <strong>Date:</strong> {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      {(sale.customerName || sale.customerMobile) && (
        <div className="mb-8">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            Bill To:
          </h3>
          {sale.customerName && (
            <p style={{ marginBottom: '4px' }}>
              <strong>Name:</strong> {sale.customerName}
            </p>
          )}
          {sale.customerMobile && (
            <p>
              <strong>Mobile:</strong> {sale.customerMobile}
            </p>
          )}
        </div>
      )}

      {/* Items Table */}
      <table style={{ width: '100%', marginBottom: '32px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>#</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Item</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Price</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any, index: number) => (
            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>{index + 1}</td>
              <td style={{ padding: '12px' }}>{item.productName}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginLeft: 'auto', width: '300px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span>Subtotal:</span>
          <span>₹{sale.subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span>Tax (18% GST):</span>
          <span>₹{sale.tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '20px', fontWeight: 'bold', color: '#4f46e5' }}>
          <span>Total:</span>
          <span>₹{sale.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <p>
          <strong>Payment Method:</strong>{' '}
          <span style={{ textTransform: 'capitalize', color: '#4f46e5' }}>
            {sale.paymentMethod}
          </span>
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px', textAlign: 'center', color: '#6b7280' }}>
        <p style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 'bold' }}>
          Thank You for Your Business!
        </p>
        <p style={{ fontSize: '14px' }}>
          For any queries, please contact us at shop@example.com or +91 1234567890
        </p>
        <p style={{ marginTop: '16px', fontSize: '12px', fontStyle: 'italic' }}>
          This is a computer-generated invoice. No signature required.
        </p>
      </div>

      {/* Barcode Section */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '16px', border: '2px dashed #d1d5db' }}>
          <p style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>Invoice Barcode</p>
          <div style={{ font: '900 48px monospace', letterSpacing: '2px' }}>
            ||||| {sale.id.slice(-8)} |||||
          </div>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';
