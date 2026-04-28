import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import ProductForm from './components/ProductForm';
import { getProducts, createProduct, updateProduct, deleteProduct, placeOrder } from './services/api';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const { refreshUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddProduct = async (productData) => {
    try {
      const newProduct = await createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      setIsProductModalOpen(false);
    } catch (error) {
      alert('Тауар қосу кезінде қате кетті. Сіз сатушы немесе әкімші емессіз бе?');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const updated = await updateProduct(productData.id, productData);
      setProducts(prev => prev.map(p => p.id === productData.id ? updated : p));
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert('Тауарды жаңарту кезінде қате кетті.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Бұл тауарды өшіргіңіз келетініне сенімдісіз бе?')) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        alert('Тауарды өшіру кезінде қате кетті.');
      }
    }
  };

  const handleOrder = async (productId) => {
    try {
      await placeOrder(productId);
      alert('Тапсырыс сәтті қабылданды!');
    } catch (error) {
      alert('Тапсырыс беру үшін жүйеге кіруіңіз керек.');
    }
  }

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  // Filter logic
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Router>
        <div className="app-container">
          <Header
            onAddClick={openAddModal}
            cartCount={cart.length}
            onCartClick={() => setIsCartOpen(true)}
          />

          <Routes>
            <Route path="/" element={
              <Home
                loading={loading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredProducts={filteredProducts}
                handleDeleteProduct={handleDeleteProduct}
                openEditModal={openEditModal}
                addToCart={addToCart}
              />
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'buyer']}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'buyer']}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'buyer']}>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {isProductModalOpen && (
            <ProductForm
              product={editingProduct}
              onClose={() => setIsProductModalOpen(false)}
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            />
          )}

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onRemove={removeFromCart}
            onCheckout={async () => {
              for (const item of cart) {
                await placeOrder(item.id);
              }
              await refreshUser();
              clearCart();
              setIsCartOpen(false);
              alert('Барлық тауарларға тапсырыс берілді!');
            }}
          />
        </div>
      </Router>
  );
}

export default App;

