import React from 'react';
import { Trash2, Edit3, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onDelete, onEdit, onAddToCart }) => {
  const { user } = useAuth();
  const isOwner = user && (user.id === product.seller_id || user.role === 'admin');

  return (
    <div className="product-card glass-effect">
      <div className={`status-badge ${product.status}`}>{product.status}</div>
      <div className="product-image-container">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} />
        ) : (
          <div className="image-placeholder">Сурет жоқ</div>
        )}
      </div>
      <h3 className="product-title">{product.title}</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Сатушы: {product.seller_name}</p>
      <div className="product-price">
        {(Number(product.price) || 0).toLocaleString()} ₸
      </div>

      <div className="product-actions">
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart size={20} />
          Себетке қосу
        </button>

        {isOwner && (
          <div className="mgmt-btn-group" style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
            <button
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.6rem' }}
              onClick={() => onEdit(product)}
            >
              <Edit3 size={16} />
            </button>
            <button
              className="btn btn-outline-danger"
              style={{ flex: 1, padding: '0.6rem' }}
              onClick={() => onDelete(product.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
