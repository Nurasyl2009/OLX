import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Plus, ShoppingCart, Home, Info, Phone,
  User, LogOut, Shield, Bell, MessageSquare, Heart,
  Menu, X, TrendingUp, Sun, Moon
} from 'lucide-react';
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
      <header className="glass-effect main-header">
        {/* ── Top Bar ── */}
        <div className="header-top-bar">
          {/* Logo */}
          <Link to="/" className="logo">
            <ShoppingBag size={26} strokeWidth={2.5} />
            <span>Satu.kz</span>
          </Link>

          {/* Desktop: icon actions */}
          <div className="header-desktop-actions">
            <button className="header-icon-link theme-btn" onClick={onThemeToggle}
              title={theme === 'dark' ? 'Күндізгі режим' : 'Түнгі режим'}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <div className="header-icon-group">
                  <Link to="/favorites" className="header-icon-link" title="Таңдаулылар">
                    <Heart size={18} />
                  </Link>
                  <Link to="/notifications" className="header-icon-link" title="Хабарламалар" style={{ position: 'relative' }}>
                    <Bell size={18} />
                    {unreadNotifs > 0 && <span className="header-badge notif-badge-pulse">{unreadNotifs}</span>}
                  </Link>
                  <Link to="/chat" className="header-icon-link" title="Чат" style={{ position: 'relative' }}>
                    <MessageSquare size={18} />
                    {unreadMsgs > 0 && <span className="header-badge msg-badge">{unreadMsgs}</span>}
                  </Link>
                  <button className="header-icon-link" onClick={onCartClick} title="Себет" style={{ position: 'relative', cursor: 'pointer' }}>
                    <ShoppingCart size={18} />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </button>
                </div>

                <div className="header-divider" />

                <div className="user-pill">
                  <div className="user-pill-info">
                    <span className="user-pill-name">{user.name.split(' ')[0]}</span>
                    <span className="user-pill-role">{user.role}</span>
                  </div>
                  <Link to="/profile" className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </Link>
                  <button onClick={logout} className="logout-icon-btn" title="Шығу">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}>
                <User size={18} />
                <span>Кіру / Тіркелу</span>
              </button>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(v => !v)}
            aria-label="Мәзірді ашу"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* ── Bottom Nav (desktop) ── */}
        <div className="header-bottom-bar">
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Home size={16} /><span>Басты бет</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Shield size={16} /><span>Админ панель</span>
              </NavLink>
            )}
            {(user?.role === 'admin' || user?.role === 'seller') && (
              <NavLink to="/seller" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <TrendingUp size={16} /><span>Сатушы кабинеті</span>
              </NavLink>
            )}
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Info size={16} /><span>Біз туралы</span>
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Phone size={16} /><span>Байланыс</span>
            </NavLink>
          </nav>

          {user && (user.role === 'admin' || user.role === 'seller') && (
            <button id="add-product-btn" className="btn btn-primary add-product-btn" onClick={onAddClick}>
              <Plus size={16} />
              <span>Тауар қосу</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          {/* User info */}
          {user ? (
            <div className="mobile-user-section">
              <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
              onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}>
              <User size={18} />
              <span>Кіру / Тіркелу</span>
            </button>
          )}

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Home size={18} /><span>Басты бет</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Shield size={18} /><span>Админ панель</span>
              </NavLink>
            )}
            {(user?.role === 'admin' || user?.role === 'seller') && (
              <NavLink to="/seller" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <TrendingUp size={18} /><span>Сатушы кабинеті</span>
              </NavLink>
            )}
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Info size={18} /><span>Біз туралы</span>
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Phone size={18} /><span>Байланыс</span>
            </NavLink>
          </nav>

          {/* Mobile icon row */}
          {user && (
            <div className="mobile-icon-row">
              <button className="mobile-theme-btn" onClick={onThemeToggle}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === 'dark' ? 'Күндізгі режим' : 'Түнгі режим'}</span>
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to="/favorites" className="header-icon-link" title="Таңдаулылар"><Heart size={20} /></Link>
                <Link to="/notifications" className="header-icon-link" style={{ position: 'relative' }}>
                  <Bell size={20} />
                  {unreadNotifs > 0 && <span className="header-badge notif-badge-pulse">{unreadNotifs}</span>}
                </Link>
                <Link to="/chat" className="header-icon-link" style={{ position: 'relative' }}>
                  <MessageSquare size={20} />
                  {unreadMsgs > 0 && <span className="header-badge msg-badge">{unreadMsgs}</span>}
                </Link>
                <button className="header-icon-link" onClick={onCartClick} style={{ position: 'relative', cursor: 'pointer' }}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
                <Link to="/profile" className="header-icon-link"><User size={20} /></Link>
              </div>
              {(user.role === 'admin' || user.role === 'seller') && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onAddClick}>
                  <Plus size={16} /><span>Тауар қосу</span>
                </button>
              )}
              <button onClick={logout} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                <LogOut size={16} /><span>Шығу</span>
              </button>
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
