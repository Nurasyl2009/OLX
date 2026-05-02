import React from 'react';
import { Trash2, Edit3, ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onDelete, onEdit, onAddToCart, isFavorite, onToggleFavorite, onView }) => {
  const { user } = useAuth();
  const isOwner = user && (Number(user.id) === Number(product.seller_id) || user.role === 'admin');

  return (
    <div className="product-card glass-effect" style={{ position: 'relative' }}>
      <button 
        onClick={() => onToggleFavorite(product.id)}
        style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 10,
          background: isFavorite ? 'var(--primary-color)' : 'rgba(0,0,0,0.5)',
          border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        <Heart size={18} fill={isFavorite ? 'white' : 'none'} />
      </button>
      <div className={`status-badge ${product.status}`} style={{ top: '10px', left: '10px', right: 'auto' }}>{product.status}</div>
      <div className="product-image-container">
        {product.image_url ? (
          <img 
            className="product-image" 
            src={product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${product.image_url}`}
            alt={product.title} 
          />
        ) : (
          <div className="image-placeholder product-image">Сурет жоқ</div>
        )}
      </div>
      <h3 className="product-title" onClick={() => onView(product)} style={{ cursor: 'pointer' }}>{product.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <Star 
              key={s} 
              size={14} 
              fill={s <= (product.avg_rating || 0) ? "#f59e0b" : "none"} 
              color={s <= (product.avg_rating || 0) ? "#f59e0b" : "#475569"} 
            />
          ))}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({product.reviews_count || 0})</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Сатушы: {product.seller_name}</p>
      <div className="product-price">
        {(Number(product.price) || 0).toLocaleString()} ₸
      </div>

      <div className="product-actions">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => onView(product)}
          >
            <Eye size={20} />
            Көру
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={20} />
            Себетке
          </button>
        </div>

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
