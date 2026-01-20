import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoiceProps {
  sale: any;
  shopName: string;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ sale, shopName }, ref) => {
  return (
    <div ref={ref} className="p-6 bg-white" style={{ width: '80mm', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px dashed #000', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          {shopName}
        </h1>
        <p style={{ fontSize: '12px', margin: '4px 0' }}>123 Business Street, City</p>
        <p style={{ fontSize: '12px', margin: '4px 0' }}>Ph: +91 1234567890</p>
        <p style={{ fontSize: '12px', margin: '4px 0' }}>GSTIN: 29XXXXX1234X1ZX</p>
      </div>

      {/* Bill Info */}
      <div style={{ fontSize: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Bill No:</span>
          <span style={{ fontWeight: 'bold' }}>{sale.id.slice(-6)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Date:</span>
          <span>{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        {sale.customerName && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Customer:</span>
            <span>{sale.customerName}</span>
          </div>
        )}
        {sale.customerMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mobile:</span>
            <span>{sale.customerMobile}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '12px 0', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontWeight: 'bold', marginBottom: '8px' }}>
            <span>ITEM</span>
            <span style={{ textAlign: 'right' }}>QTY</span>
            <span style={{ textAlign: 'right' }}>PRICE</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>
          {sale.items.map((item: any, index: number) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', marginBottom: '6px' }}>
              <span>{item.productName}</span>
              <span style={{ textAlign: 'right' }}>{item.quantity}</span>
              <span style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</span>
              <span style={{ textAlign: 'right' }}>{item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div style={{ fontSize: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal:</span>
          <span>₹{sale.subtotal.toFixed(2)}</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Discount:</span>
            <span>-₹{sale.discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>GST (18%):</span>
          <span>₹{sale.tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #000' }}>
          <span>TOTAL:</span>
          <span>₹{sale.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ fontSize: '12px', marginBottom: '16px', textAlign: 'center', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <span>Payment Mode: </span>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{sale.paymentMethod}</span>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px dashed #000', paddingTop: '12px', textAlign: 'center', fontSize: '11px' }}>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Thank You! Visit Again!</p>
        <p style={{ margin: '4px 0' }}>Powered by PetPooja</p>
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
            ||| {sale.id.slice(-6)} |||
          </p>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';
