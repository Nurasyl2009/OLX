import React from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const Home = ({ 
  loading, 
  searchQuery, 
  setSearchQuery, 
  filteredProducts, 
  handleDeleteProduct, 
  openEditModal, 
  addToCart 
}) => {
  return (
    <main>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Satu.kz — Қолданылған заттар</h1>
        <p style={{ color: 'var(--text-muted)' }}>Өзіңізге қажетті заттарды оңай табыңыз немесе өз затыңызды сатыңыз.</p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Жүктелуде...</div>
      ) : (
        <>
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDelete={handleDeleteProduct}
                  onEdit={openEditModal}
                  onAddToCart={addToCart}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Тауарлар табылмады.
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default Home;
