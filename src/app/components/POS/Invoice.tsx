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
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{shopName}</h1>
        <p style={{ fontSize: '10px', marginBottom: '2px' }}>{sale.customerName || 'Walk-in Customer'}</p>
        {sale.customerMobile && <p style={{ fontSize: '10px', marginBottom: '2px' }}>Ph: {sale.customerMobile}</p>}
        <p style={{ fontSize: '9px', color: '#666' }}>{new Date(sale.createdAt).toLocaleString()}</p>
        <p style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '4px' }}>Invoice: #{sale.id}</p>
      </div>

      {/* Items */}
      <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '12px 0', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontWeight: 'bold', marginBottom: '8px' }}>
            <span>ITEM</span>
            <span style={{ textAlign: 'right' }}>KG/QTY</span>
            <span style={{ textAlign: 'right' }}>PRICE</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>
          {sale.items.map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                <span>{item.productName}</span>
                <span style={{ textAlign: 'right' }}>
                  {item.weight && item.unit 
                    ? `${item.weight}${item.unit}×${item.quantity}`
                    : `${item.quantity}`
                  }
                </span>
                <span style={{ textAlign: 'right' }}>{(item.price || 0).toFixed(2)}</span>
                <span style={{ textAlign: 'right' }}>{(item.total || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div style={{ fontSize: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal:</span>
          <span>₹{(sale.subtotal || 0).toFixed(2)}</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Discount:</span>
            <span>-₹{(sale.discount || 0).toFixed(2)}</span>
          </div>
        )}
        {sale.gstEnabled && sale.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>GST:</span>
            <span>₹{(sale.tax || 0).toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #000' }}>
          <span>TOTAL:</span>
          <span>₹{(sale.total || 0).toFixed(2)}</span>
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
        <p style={{ margin: '4px 0' }}>Powered by JR Invoice Maker</p>
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