import React from 'react';
import ProductCard from '../components/ProductCard';

const Favorites = ({ products, handleDeleteProduct, openEditModal, addToCart, favorites, onToggleFavorite }) => {
  return (
    <main>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Таңдаулылар</h1>
        <p style={{ color: 'var(--text-muted)' }}>Өзіңізге ұнаған және сақтап қойған тауарлар тізімі.</p>
      </div>

      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDeleteProduct}
              onEdit={openEditModal}
              onAddToCart={addToCart}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Таңдаулы тауарлар тізімі бос.
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorites;
