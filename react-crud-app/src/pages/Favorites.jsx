import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFavorites } from '../services/api';

const Favorites = ({ handleDeleteProduct, openEditModal, addToCart, favorites, onToggleFavorite }) => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavorites();
        setFavoriteProducts(data);
      } catch (error) {
        console.error('Failed to load favorites', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [favorites]); // re-fetch if favorites change (or just rely on the toggle)

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Жүктелуде...</div>;
  }

  return (
    <main>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Таңдаулылар</h1>
        <p style={{ color: 'var(--text-muted)' }}>Өзіңізге ұнаған және сақтап қойған тауарлар тізімі.</p>
      </div>

      <div className="product-grid">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDeleteProduct}
              onEdit={openEditModal}
              onAddToCart={addToCart}
              isFavorite={true}
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
