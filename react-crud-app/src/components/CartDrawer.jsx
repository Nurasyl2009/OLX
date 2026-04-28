import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onRemove, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag />
          Себет
        </h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={28} />
        </button>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b' }}>
            Себет бос...
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="cart-item" style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ color: '#22c55e' }}>{(Number(item.price) || 0).toLocaleString()} ₸</div>
              </div>
              <button 
                onClick={() => onRemove(index)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-total" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold'}}>
          <span>Барлығы:</span>
          <span>{total.toLocaleString()} ₸</span>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1.2rem', borderRadius: '12px' }}
          disabled={cartItems.length === 0}
          onClick={onCheckout}
        >
          Тапсырыс беру
        </button>
      </div>
    </div>
  );
};

export default CartDrawer;
