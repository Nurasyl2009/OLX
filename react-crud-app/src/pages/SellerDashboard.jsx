import React, { useState, useEffect } from 'react';
import { getSellerStats, getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Package, DollarSign, ShoppingCart, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sales: 0, revenue: 0, products: 0 });
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, p] = await Promise.all([
          getSellerStats(),
          getProducts()
        ]);
        setStats(s);
        // Filter products to show only current seller's products
        const allProducts = p.products || [];
        setMyProducts(allProducts.filter(prod => prod.seller_id === user.id));
      } catch (err) {
        console.error('Failed to fetch seller data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Жүктелуде...</div>;

  return (
    <div className="seller-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Сатушы кабинеті</h1>
          <p style={{ color: 'var(--text-muted)' }}>Қош келдіңіз, {user.name}! Сауда-саттық барысын бақылаңыз.</p>
        </div>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
          <Plus size={20} /> Жаңа тауар
        </Link>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="stat-card glass-effect" style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <ShoppingCart size={24} color="#3b82f6" />
            </div>
            <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              +12% <ArrowUpRight size={14} />
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Жалпы сатылым</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stats.sales}</h2>
        </div>

        <div className="stat-card glass-effect" style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <DollarSign size={24} color="#22c55e" />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Жалпы табыс</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stats.revenue.toLocaleString()} ₸</h2>
        </div>

        <div className="stat-card glass-effect" style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Package size={24} color="#a855f7" />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Белсенді тауарлар</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stats.products}</h2>
        </div>
      </div>

      <div className="recent-activity glass-effect" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Менің тауарларым</h3>
        {myProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Сізде әлі тауар жоқ.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Тауар</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Бағасы</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {p.image_url && <img src={p.image_url.startsWith('http') ? p.image_url : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${p.image_url}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                        <span style={{ fontWeight: '600' }}>{p.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{p.price.toLocaleString()} ₸</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        background: p.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: p.status === 'active' ? '#22c55e' : '#f59e0b'
                      }}>
                        {p.status === 'active' ? 'Белсенді' : 'Күтуде'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
