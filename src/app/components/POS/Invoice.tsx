import React, { forwardRef } from 'react';

interface InvoiceProps {
  sale: any;
  user: any;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ sale, user }, ref) => {
  return (
    <div ref={ref} className="p-6 bg-white" style={{ width: '80mm', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>
          {user?.shopName || 'JR Invoice Maker'}
        </h1>
        {user?.address && (
          <p style={{ fontSize: '10px', marginBottom: '4px', color: '#333' }}>
            {user.address}
          </p>
        )}
        {user?.phone && (
          <p style={{ fontSize: '10px', marginBottom: '4px', color: '#333' }}>
            Phone: {user.phone}
          </p>
        )}
        {user?.gstNumber && (
          <p style={{ fontSize: '10px', marginBottom: '4px', color: '#333', fontWeight: 'bold' }}>
            GST: {user.gstNumber}
          </p>
        )}
        <div style={{ borderTop: '1px dashed #666', marginTop: '8px', paddingTop: '8px' }}>
          <p style={{ fontSize: '10px', marginBottom: '2px' }}>
            <strong>Customer:</strong> {sale.customerName || 'Walk-in Customer'}
          </p>
          {sale.customerMobile && (
            <p style={{ fontSize: '10px', marginBottom: '2px' }}>
              <strong>Phone:</strong> {sale.customerMobile}
            </p>
          )}
          <p style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
            {new Date(sale.createdAt).toLocaleString()}
          </p>
          <p style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '6px' }}>
            Invoice: #{sale.id.slice(-8)}
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '12px 0', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
            <span>ITEM</span>
            <span style={{ textAlign: 'right' }}>QTY</span>
            <span style={{ textAlign: 'right' }}>PRICE</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>
          {sale.items.map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{item.name}</div>
                  {item.customWeight && item.customUnit && (
                    <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                      {item.customWeight}{item.customUnit} each
                    </div>
                  )}
                </div>
                <span style={{ textAlign: 'right' }}>
                  ×{item.quantity}
                </span>
                <span style={{ textAlign: 'right' }}>{(item.price || 0).toFixed(2)}</span>
                <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{(item.total || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div style={{ fontSize: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', padding: '4px 0' }}>
          <span>Subtotal:</span>
          <span>₹{(sale.subtotal || 0).toFixed(2)}</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#16a34a', padding: '4px 0' }}>
            <span>Discount:</span>
            <span>-₹{(sale.discount || 0).toFixed(2)}</span>
          </div>
        )}
        {sale.applyGst && sale.gstAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', padding: '4px 0' }}>
            <span>GST:</span>
            <span>₹{(sale.gstAmount || 0).toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', paddingTop: '8px', borderTop: '2px solid #000', marginTop: '8px' }}>
          <span>TOTAL:</span>
          <span>₹{(sale.total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ fontSize: '12px', marginBottom: '16px', textAlign: 'center', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #d1d5db' }}>
        <span style={{ fontWeight: 'normal' }}>Payment Mode: </span>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}>{sale.paymentMethod}</span>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px dashed #000', paddingTop: '12px', textAlign: 'center', fontSize: '11px' }}>
        <p style={{ margin: '6px 0', fontWeight: 'bold', fontSize: '13px' }}>Thank You! Visit Again!</p>
        <p style={{ margin: '4px 0', fontSize: '10px', color: '#666' }}>Powered by JR Invoice Maker</p>
        {user?.email && (
          <p style={{ margin: '4px 0', fontSize: '9px', color: '#666' }}>
            {user.email}
          </p>
        )}
        <div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ccc' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '3px', fontFamily: 'monospace' }}>
            ||| {sale.id.slice(-6).toUpperCase()} |||
          </p>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';
