import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Plus, ShoppingCart, Home, Info, Phone, User, LogOut, Shield, Bell, MessageSquare, Heart, Menu, X, TrendingUp, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { getNotificationUnreadCount, getMessagesUnreadCount } from '../services/api';

const Header = ({ onAddClick, cartCount, onCartClick, theme, onThemeToggle }) => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const [n, m] = await Promise.all([
          getNotificationUnreadCount(),
          getMessagesUnreadCount()
        ]);
        setUnreadNotifs(n.count);
        setUnreadMsgs(m.count);
      } catch (err) {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <header className="glass-effect">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ShoppingBag size={32} strokeWidth={2.5} />
          <span>Satu.kz</span>
        </Link>

        {/* Desktop & Mobile Menu wrapper */}
        <div className={`header-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Home size={20} />
              <span>Басты бет</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Shield size={20} />
                <span>Админ панель</span>
              </NavLink>
            )}
            {(user?.role === 'admin' || user?.role === 'seller') && (
              <NavLink to="/seller" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <TrendingUp size={20} />
                <span>Сатушы кабинеті</span>
              </NavLink>
            )}
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Info size={20} />
              <span>Біз туралы</span>
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Phone size={20} />
              <span>Байланыс</span>
            </NavLink>
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <div className="user-greeting">
                  <span>Сәлем, <strong style={{color: 'var(--primary-color)'}}>{user.name.split(' ')[0]}</strong></span>
                  <span style={{opacity: 0.6, fontSize: '0.75rem'}}>{user.role}</span>
                </div>
                
                <div className="icon-group">
                  <Link to="/favorites" className="header-icon-link" title="Таңдаулылар">
                    <Heart size={20} />
                  </Link>
                  <Link to="/notifications" className="header-icon-link" title="Хабарламалар">
                    <Bell size={20} />
                    {unreadNotifs > 0 && <span className="header-badge notif-badge-pulse">{unreadNotifs}</span>}
                  </Link>
                  <Link to="/chat" className="header-icon-link" title="Чат">
                    <MessageSquare size={20} />
                    {unreadMsgs > 0 && <span className="header-badge msg-badge">{unreadMsgs}</span>}
                  </Link>
                  <Link to="/profile" className="header-icon-link" title="Профиль">
                    <User size={20} />
                  </Link>
                </div>

                <div className="btn-group">
                  {(user.role === 'admin' || user.role === 'seller') && (
                    <button id="add-product-btn" className="btn btn-primary btn-sm" onClick={onAddClick}>
                      <Plus size={18} />
                      <span className="hide-mobile">Тауар қосу</span>
                    </button>
                  )}
                  <button className="cart-icon-btn" onClick={onCartClick}>
                    <ShoppingCart size={22} />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </button>
                  <button className="btn btn-icon-only" onClick={logout} title="Шығу" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '10px'}}>
                    <LogOut size={18} color="#ef4444" />
                  </button>
                </div>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                <User size={20} />
                <span>Кіру / Тіркелу</span>
              </button>
            )}
            
            <button 
              className="theme-toggle-btn" 
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Күндізгі режим' : 'Түнгі режим'}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
