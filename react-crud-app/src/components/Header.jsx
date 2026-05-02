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
      <header className="glass-effect" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 1.5rem', alignItems: 'stretch' }}>
        
        {/* Top Row: Logo & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1.6rem' }}>
            <ShoppingBag size={28} strokeWidth={2.5} />
            <span>Satu.kz</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="header-icon-link" 
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Күндізгі режим' : 'Түнгі режим'}
              style={{ background: 'transparent', border: 'none' }}
            >
              {theme === 'dark' ? <Sun size={20} color="var(--text-main)" /> : <Moon size={20} color="var(--text-main)" />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link to="/favorites" className="header-icon-link" title="Таңдаулылар">
                    <Heart size={18} />
                  </Link>
                  <Link to="/notifications" className="header-icon-link" title="Хабарламалар">
                    <Bell size={18} />
                    {unreadNotifs > 0 && <span className="header-badge notif-badge-pulse">{unreadNotifs}</span>}
                  </Link>
                  <Link to="/chat" className="header-icon-link" title="Чат">
                    <MessageSquare size={18} />
                    {unreadMsgs > 0 && <span className="header-badge msg-badge">{unreadMsgs}</span>}
                  </Link>
                  <button className="header-icon-link" onClick={onCartClick} title="Себет" style={{ cursor: 'pointer' }}>
                    <ShoppingCart size={18} />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </button>
                </div>

                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  padding: '0.3rem 0.3rem 0.3rem 1rem', 
                  background: 'var(--glass)', borderRadius: '50px', 
                  border: '1px solid var(--border)' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user.role}
                    </span>
                  </div>
                  <Link to="/profile" style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Link>
                  <button onClick={logout} title="Шығу" style={{ 
                    background: 'transparent', border: 'none', color: '#ef4444', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 0.4rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
                <User size={18} />
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Кіру / Тіркелу</span>
              </button>
            )}
            
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ display: 'none' }}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation & Add Product */}
        <div className={`header-content ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          borderTop: '1px solid var(--border)', paddingTop: '1rem', flex: 'none'
        }}>
          <nav className="nav-menu" style={{ gap: '1rem', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'wrap' }}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
              <Home size={16} />
              <span style={{ whiteSpace: 'nowrap' }}>Басты бет</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
                <Shield size={16} />
                <span style={{ whiteSpace: 'nowrap' }}>Админ панель</span>
              </NavLink>
            )}
            {(user?.role === 'admin' || user?.role === 'seller') && (
              <NavLink to="/seller" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
                <TrendingUp size={16} />
                <span style={{ whiteSpace: 'nowrap' }}>Сатушы кабинеті</span>
              </NavLink>
            )}
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
              <Info size={16} />
              <span style={{ whiteSpace: 'nowrap' }}>Біз туралы</span>
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
              <Phone size={16} />
              <span style={{ whiteSpace: 'nowrap' }}>Байланыс</span>
            </NavLink>
          </nav>

          {user && (user.role === 'admin' || user.role === 'seller') && (
            <button id="add-product-btn" className="btn btn-primary" onClick={onAddClick} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', flexShrink: 0 }}>
              <Plus size={16} />
              <span className="hide-mobile" style={{ whiteSpace: 'nowrap', fontSize: '0.9rem', fontWeight: 'bold' }}>Тауар қосу</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
