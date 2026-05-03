import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { getProducts } from '../services/api';

const Home = ({ 
  searchQuery, 
  setSearchQuery, 
  handleDeleteProduct, 
  openEditModal, 
  addToCart,
  favorites,
  onToggleFavorite,
  refreshKey
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Барлығы');
  const [sortOption, setSortOption] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = ['Барлығы', 'Электроника', 'Киім', 'Көлік', 'Үй жабдықтары', 'Басқа'];

  const fetchProducts = async (pageNumber, isAppend = false) => {
    if (!isAppend) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getProducts({
        search: searchQuery,
        category: selectedCategory,
        minPrice,
        maxPrice,
        sort: sortOption,
        page: pageNumber,
        limit: 12
      });

      if (isAppend) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }
      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1);
    }, 400); // Debounce to prevent too many API requests while typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, sortOption, minPrice, maxPrice, refreshKey]);

  const loadMore = () => {
    if (page < totalPages) {
      fetchProducts(page + 1, true);
    }
  };

  // Replace App's handleDeleteProduct with local UI update + API call if needed
  // App.jsx still passes handleDeleteProduct which does API call and filtered state update.
  // We can wrap it to also update local state instantly.
  const handleLocalDelete = async (id) => {
    await handleDeleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <main>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Satu.kz — Қолданылған заттар</h1>
        <p style={{ color: 'var(--text-muted)' }}>Өзіңізге қажетті заттарды оңай табыңыз немесе өз затыңызды сатыңыз.</p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="filter-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ whiteSpace: 'nowrap', borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Бағасы:</span>
            <input 
              type="number" 
              placeholder="Мин" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-card)', color: 'white' }}
            />
            <span>—</span>
            <input 
              type="number" 
              placeholder="Макс" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-card)', color: 'white' }}
            />
          </div>

          <div style={{ flex: 1 }}></div>

          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-card)', color: 'white', cursor: 'pointer' }}
          >
            <option value="newest">Жаңадан қосылғандар</option>
            <option value="price_asc">Арзаннан бастап</option>
            <option value="price_desc">Қымбаттан бастап</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Жүктелуде...</div>
      ) : (
        <>
          <div className="product-grid">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDelete={handleLocalDelete}
                  onEdit={openEditModal}
                  onAddToCart={addToCart}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onView={setSelectedProduct}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Тауарлар табылмады.
              </div>
            )}
          </div>
          
          {page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                onClick={loadMore} 
                disabled={loadingMore}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2rem', borderRadius: '25px' }}
              >
                {loadingMore ? 'Жүктелуде...' : 'Тағы көрсету'}
              </button>
            </div>
          )}

          {selectedProduct && (
            <ProductDetailsModal 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
            />
          )}
        </>
      )}
    </main>
  );
};

export default Home;
