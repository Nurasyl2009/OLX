import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductForm from './components/ProductForm';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import Favorites from './pages/Favorites';
import SellerDashboard from './pages/SellerDashboard';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import { useAuth } from './context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, getFavorites, addFavorite, removeFavorite, placeOrder } from './services/api';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { user } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (user) {
      getFavorites().then(data => setFavorites(data.map(f => f.product_id))).catch(console.error);
    } else {
      setFavorites([]);
    }
  }, [user]);

  const handleToggleFavorite = async (productId) => {
    if (!user) return alert("Таңдаулыларға қосу үшін жүйеге кіріңіз");
    try {
      if (favorites.includes(productId)) {
        await removeFavorite(productId);
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await addFavorite(productId);
        setFavorites(prev => [...prev, productId]);
      }
    } catch(err) {
      console.error(err);
    }
  };

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
      setProducts(prev => [{ ...newProduct, seller_name: user.name }, ...prev]);
      setIsProductModalOpen(false);
    } catch (error) {
      alert('Тауар қосу кезінде қате кетті');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const updated = await updateProduct(productData.id, productData);
      setProducts(prev => prev.map(p => p.id === productData.id ? { ...p, ...updated } : p));
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert('Тауарды жаңарту кезінде қате кетті');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Бұл тауарды өшіргіңіз келетініне сенімдісіз бе?')) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        alert('Тауарды өшіру кезінде қате кетті');
      }
    }
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setIsCartOpen(true); 
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Тапсырыс беру үшін жүйеге кіріңіз");
      return;
    }
    try {
      await Promise.all(cart.map(item => placeOrder(item.id)));
      alert("Тапсырысыңыз сәтті қабылданды! Сатушы сізбен байланысады.");
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Тапсырыс беру кезінде қате кетті.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    (p.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="app-container">
      <Header 
        onAddClick={openAddModal} 
        cartCount={cart.length} 
        onCartClick={() => setIsCartOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
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
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites 
              products={products.filter(p => favorites.includes(p.id))} 
              handleDeleteProduct={handleDeleteProduct}
              openEditModal={openEditModal}
              addToCart={addToCart}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <SellerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
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
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;
