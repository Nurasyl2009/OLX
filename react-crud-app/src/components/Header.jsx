import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingBag, Plus, ShoppingCart, Home, Info, Phone, User, LogOut, Shield, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { getNotificationUnreadCount, getMessagesUnreadCount } from '../services/api';

const Header = ({ onAddClick, cartCount, onCartClick }) => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

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
                <span>Сәлем, <strong>{user.name}</strong></span>
                <span>({user.role})</span>
              </div>
              <button className="cart-icon-btn" onClick={onCartClick}>
                <ShoppingCart size={22} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              {(user.role === 'admin' || user.role === 'seller') && (
                <button id="add-product-btn" className="btn btn-primary" onClick={onAddClick}>
                  <Plus size={20} />
                  <span>Тауар қосу</span>
                </button>
              )}
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
              <button className="btn" onClick={logout} title="Шығу">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}>
              <User size={20} />
              <span>Кіру / Тіркелу</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
