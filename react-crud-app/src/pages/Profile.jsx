import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Package, ShoppingBag, Settings, Bell, BarChart3 } from 'lucide-react';
import { getOrders, getNotifications, getSellerStats, markNotificationsAsRead, submitSellerRequest, getSellerRequestStatus } from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [sellerRequest, setSellerRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'orders') {
          const ordersData = await getOrders();
          setOrders(ordersData);
        } else if (activeTab === 'products' && (user.role === 'seller' || user.role === 'admin')) {
          const productsResponse = await axios.get(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/my-products` : (import.meta.env.PROD ? '/api/my-products' : 'http://localhost:5000/api/my-products'), {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setMyProducts(productsResponse.data);
        } else if (activeTab === 'notifications') {
          const notifs = await getNotifications();
          setNotifications(notifs);
          await markNotificationsAsRead();
        } else if (activeTab === 'stats' && (user.role === 'seller' || user.role === 'admin')) {
          const sData = await getSellerStats();
          setStats(sData);
        } else if (activeTab === 'settings' && user.role === 'buyer') {
          const reqStatus = await getSellerRequestStatus();
          setSellerRequest(reqStatus);
        }
      } catch (err) {
        console.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user, activeTab]);

  if (!user) return <div className="container">Кіру қажет...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="profile-header glass-effect" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div className="profile-avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <User size={50} />
        </div>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{user.name}</h1>
            <span className="role-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {user.role.toUpperCase()}
            </span>
          </div>
          <p style={{ color: '#64748b' }}>{user.phone}</p>
        </div>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        <div className="profile-sidebar">
            <div className="glass-effect" style={{ padding: '1rem', borderRadius: '15px' }}>
                <button 
                    className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} 
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', borderRadius: '10px' }}
                    onClick={() => setActiveTab('orders')}
                >
                    <Package size={18} style={{ marginRight: '10px' }} /> Тапсырыстарым
                </button>
                {(user.role === 'seller' || user.role === 'admin') && (
                    <>
                    <button 
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`} 
                        style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', borderRadius: '10px' }}
                        onClick={() => setActiveTab('products')}
                    >
                        <ShoppingBag size={18} style={{ marginRight: '10px' }} /> Менің тауарларым
                    </button>
                    <button 
                        className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`} 
                        style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', borderRadius: '10px' }}
                        onClick={() => setActiveTab('stats')}
                    >
                        <BarChart3 size={18} style={{ marginRight: '10px' }} /> Статистика
                    </button>
                    </>
                )}
                <button 
                    className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-outline'}`} 
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', borderRadius: '10px' }}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} style={{ marginRight: '10px' }} /> Хабарламалар
                </button>
                <button 
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} 
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '10px' }}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={18} style={{ marginRight: '10px' }} /> Баптаулар
                </button>
            </div>
        </div>

        <div className="profile-main">
          {activeTab === 'orders' && (
            <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Соңғы тапсырыстар</h2>
                {loading ? <p>Жүктелуде...</p> : (
                <div className="orders-list">
                    {orders.length > 0 ? orders.map(order => (
                    <div key={order.order_id} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                        <p style={{ margin: 0, fontWeight: '700' }}>{order.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{new Date(order.ordered_at).toLocaleDateString('kk-KZ', { timeZone: 'Asia/Almaty' })}</p>
                        </div>
                        <p style={{ fontWeight: '800', color: '#22c55e', margin: 0 }}>{order.price} ₸</p>
                    </div>
                    )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Тапсырыстар жоқ.</p>}
                </div>
                )}
            </section>
          )}

          {activeTab === 'products' && (user.role === 'seller' || user.role === 'admin') && (
            <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Сатылымдағы тауарлар</h2>
              {loading ? <p>Жүктелуде...</p> : (
                <div className="my-products-list">
                    {myProducts.length > 0 ? myProducts.map(prod => (
                    <div key={prod.id} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontWeight: '700' }}>{prod.title}</p>
                        <span className={`status-badge ${prod.status}`} style={{ margin: 0 }}>{prod.status}</span>
                    </div>
                    )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Тауарларыңыз жоқ.</p>}
                </div>
              )}
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Хабарламалар</h2>
                {loading ? <p>Жүктелуде...</p> : (
                <div className="notifications-list">
                    {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', marginBottom: '0.5rem' }}>
                        <p style={{ margin: 0, fontWeight: notif.is_read ? '400' : '700' }}>{notif.message}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{new Date(notif.created_at).toLocaleString('kk-KZ', { timeZone: 'Asia/Almaty' })}</p>
                    </div>
                    )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Хабарламалар жоқ.</p>}
                </div>
                )}
            </section>
          )}

          {activeTab === 'stats' && (user.role === 'seller' || user.role === 'admin') && (
            <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Сату статистикасы</h2>
              {loading ? <p>Жүктелуде...</p> : stats && (
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>Жалпы сатылым</p>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.sales}</h3>
                    </div>
                    <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>Табыс</p>
                        <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#22c55e' }}>{stats.revenue.toLocaleString()} ₸</h3>
                    </div>
                    <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>Тауарлар саны</p>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.products}</h3>
                    </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SettingsForm user={user} onUpdate={refreshUser} />
              {user.role === 'buyer' && (
                <SellerRequestSection request={sellerRequest} onSubmit={async (reason) => {
                  const res = await submitSellerRequest(reason);
                  const updated = await getSellerRequestStatus();
                  setSellerRequest(updated);
                  return res;
                }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsForm = ({ user, onUpdate }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth/profile` : (import.meta.env.PROD ? '/api/auth/profile' : 'http://localhost:5000/api/auth/profile'), { name, phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await onUpdate();
            alert('Баптаулар сәтті сақталды!');
        } catch (err) {
            alert('Қате кетті: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Жеке баптаулар</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Толық аты-жөніңіз</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Телефон нөмірі</label>
                    <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={saving}>
                    {saving ? 'Сақталуда...' : 'Өзгерістерді сақтау'}
                </button>
            </form>
        </section>
    );
};
const SellerRequestSection = ({ request, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(reason);
            setMessage('✅ Өтінім сәтті жіберілді! Админ қарастырады.');
            setReason('');
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const statusColors = {
        pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: '⏳ Қаралуда...' },
        approved: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', text: '✅ Бекітілді' },
        rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: '❌ Қабылданбады' },
    };

    return (
        <section className="glass-effect" style={{ padding: '2rem', borderRadius: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>🏪 Сатушы болу</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Тауар сата бастау үшін сатушы өтінімін жіберіңіз.
            </p>

            {request && (
                <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: statusColors[request.status]?.bg || 'transparent' }}>
                    <p style={{ margin: 0, fontWeight: '700', color: statusColors[request.status]?.color }}>
                        {statusColors[request.status]?.text}
                    </p>
                    {request.reason && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Себеп: {request.reason}</p>}
                </div>
            )}

            {(!request || request.status === 'rejected') && (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Өтінім себебі (не сатқыңыз келеді?)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="мысалы: Электроника тауарлары сатқым келеді..."
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical' }}
                            required
                        />
                    </div>
                    {message && <p style={{ color: message.startsWith('✅') ? '#22c55e' : '#ef4444', marginBottom: '1rem' }}>{message}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? 'Жіберілуде...' : '📨 Өтінім жіберу'}
                    </button>
                </form>
            )}
        </section>
    );
};

export default Profile;
