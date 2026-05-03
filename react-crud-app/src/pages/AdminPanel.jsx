import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateRole, deleteUser, getLogs, getProducts, deleteProduct, getAllOrders, getAdminSellerRequests, approveSellerRequest, rejectSellerRequest } from '../services/api';
import { 
  Users, ShoppingBag, FileText, Trash2, Shield, UserX, AlertCircle, 
  LayoutDashboard, TrendingUp, DollarSign, Package, Search, Bell, 
  Settings, ChevronRight, PieChart, Activity, ShoppingCart, History, LogOut
} from 'lucide-react';

const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await getUsers();
        setUsers(data);
      } else if (activeTab === 'products') {
        const data = await getProducts({ limit: 1000 }); // Admin needs all products
        setProducts(data.products || []);
      } else if (activeTab === 'logs') {
        const data = await getLogs();
        setLogs(data);
      } else if (activeTab === 'orders') {
        const data = await getAllOrders();
        setOrders(data);
      } else if (activeTab === 'seller-requests') {
        const data = await getAdminSellerRequests();
        setSellerRequests(data);
      } else if (activeTab === 'dashboard') {
          const [u, p, l, o, sr] = await Promise.all([
            getUsers(),
            getProducts(),
            getLogs(),
            getAllOrders(),
            getAdminSellerRequests()
          ]);
          setUsers(u);
          setProducts(p.products || []);
          setLogs(l);
          setOrders(o);
          setSellerRequests(sr);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Сенімдісіз бе?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Сенімдісіз бе?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Shield className="logo-icon" />
          <span>Admin Portal</span>
        </div>
        
        <div className="sidebar-section">
          <p className="section-label">OVERVIEW</p>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Users
          </button>
          <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={20} /> Products
          </button>
        </div>

        <div className="sidebar-section">
          <p className="section-label">ACTIVITY</p>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <History size={20} /> Order History
          </button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <FileText size={20} /> System Logs
          </button>
          <button className={`nav-item ${activeTab === 'seller-requests' ? 'active' : ''}`} onClick={() => setActiveTab('seller-requests')} style={{ position: 'relative' }}>
            <Users size={20} /> Seller Requests
            {sellerRequests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {sellerRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        <div className="sidebar-footer">
            <button className="nav-item logout-btn" onClick={logout}>
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div className="search-box" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0.6rem 1rem', borderRadius: '12px', width: '300px' }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Іздеу..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.8rem', width: '100%', fontSize: '0.95rem' }} 
            />
          </div>
          <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => navigate('/')}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                🏠 Басты бетке өту
            </button>
            <Bell size={22} color="#64748b" style={{ cursor: 'pointer' }} />
            <div className="admin-profile-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
              A
            </div>
          </div>
        </header>

        <div className="admin-scroll-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h1 className="view-title">Dashboard</h1>
              <p className="view-subtitle">Welcome back. Here's your platform overview.</p>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <p className="stat-label">Total Users</p>
                    <h2 className="stat-value">{users.length}</h2>
                    <p className="stat-change positive">Platform growth</p>
                  </div>
                  <Users className="stat-icon users" />
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <p className="stat-label">Active Listings</p>
                    <h2 className="stat-value">{products.length}</h2>
                    <p className="stat-change positive">Active items</p>
                  </div>
                  <ShoppingBag className="stat-icon products" />
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <p className="stat-label">Total Orders</p>
                    <h2 className="stat-value">{orders.length}</h2>
                    <p className="stat-change positive">Completed trades</p>
                  </div>
                  <ShoppingCart className="stat-icon logs" />
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <p className="stat-label">Total Revenue</p>
                    <h2 className="stat-value">₸ {totalRevenue.toLocaleString()}</h2>
                    <p className="stat-change positive">Gross volume</p>
                  </div>
                  <DollarSign className="stat-icon revenue" />
                </div>
              </div>

              <div className="dashboard-charts-grid">
                  <div className="chart-placeholder glass-effect">
                      <h3>Activity Overview</h3>
                      <div className="mock-chart">
                          <div className="mock-bar" style={{height: `${Math.min(100, users.length * 10)}%`}}></div>
                          <div className="mock-bar" style={{height: `${Math.min(100, products.length * 5)}%`}}></div>
                          <div className="mock-bar" style={{height: `${Math.min(100, orders.length * 20)}%`}}></div>
                          <div className="mock-bar" style={{height: '40%'}}></div>
                          <div className="mock-bar" style={{height: '60%'}}></div>
                          <div className="mock-bar" style={{height: '30%'}}></div>
                      </div>
                      <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.7rem', color: '#64748b'}}>
                          <span>● Users</span>
                          <span>● Products</span>
                          <span>● Orders</span>
                      </div>
                  </div>
                  <div className="chart-placeholder glass-effect">
                      <h3>User Roles</h3>
                      <div className="mock-pie" style={{
                          background: `conic-gradient(
                            #22c55e 0% ${users.filter(u => u.role === 'buyer').length / users.length * 100 || 0}%, 
                            #3b82f6 ${users.filter(u => u.role === 'buyer').length / users.length * 100 || 0}% ${ (users.filter(u => u.role === 'buyer').length + users.filter(u => u.role === 'seller').length) / users.length * 100 || 0}%, 
                            #f59e0b ${ (users.filter(u => u.role === 'buyer').length + users.filter(u => u.role === 'seller').length) / users.length * 100 || 0}% 100%)`
                      }}>
                          <div className="pie-slice"></div>
                      </div>
                      <div style={{marginTop: '1rem', fontSize: '0.7rem', color: '#64748b'}}>
                          <p>Buyer: {users.filter(u => u.role === 'buyer').length}</p>
                          <p>Seller: {users.filter(u => u.role === 'seller').length}</p>
                          <p>Admin: {users.filter(u => u.role === 'admin').length}</p>
                      </div>
                  </div>
              </div>

              <div className="recent-orders-section glass-effect" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '24px', background: 'white', border: '1px solid #e2e8f0'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                      <h3 style={{margin: 0}}>Recent Orders</h3>
                      <button className="btn-text" onClick={() => setActiveTab('orders')} style={{color: '#22c55e', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none'}}>View All <ChevronRight size={16} /></button>
                  </div>
                  <table className="admin-table">
                      <thead>
                          <tr>
                              <th>Order ID</th>
                              <th>Product</th>
                              <th>Buyer</th>
                              <th>Price</th>
                              <th>Date</th>
                          </tr>
                      </thead>
                      <tbody>
                          {orders.slice(0, 5).map(o => (
                              <tr key={o.order_id}>
                                  <td>#ORD-{o.order_id}</td>
                                  <td><strong>{o.title}</strong></td>
                                  <td>{o.buyer_name}</td>
                                  <td>{o.price} ₸</td>
                                  <td>{new Date(o.ordered_at).toLocaleDateString('kk-KZ', { timeZone: 'Asia/Almaty' })}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {(activeTab === 'users' || activeTab === 'products' || activeTab === 'logs' || activeTab === 'orders') && (
            <div className="table-view">
              <h1 className="view-title">{activeTab.toUpperCase()}</h1>
              <div className="glass-effect table-container">
                {loading ? <p>Loading...</p> : (
                  <>
                    {activeTab === 'users' && (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery))
                            .map(u => (
                            <tr key={u.id}>
                              <td>{u.name}</td>
                              <td>{u.phone}</td>
                              <td>
                                <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)} className="role-select">
                                  <option value="buyer">Buyer</option>
                                  <option value="seller">Seller</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td>
                                <button className="btn-icon delete" onClick={() => handleDeleteUser(u.id)}><UserX size={18} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === 'products' && (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products
                            .filter(p => (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.seller_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(p => (
                            <tr key={p.id}>
                              <td>{p.title}</td>
                              <td>{p.seller_name}</td>
                              <td>{p.price} ₸</td>
                              <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                              <td>
                                <button className="btn-icon delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={18} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === 'orders' && (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders
                            .filter(o => (o.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.buyer_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(o => (
                            <tr key={o.order_id}>
                              <td>{o.title}</td>
                              <td>{o.buyer_name}</td>
                              <td>{o.seller_name}</td>
                              <td>{o.price} ₸</td>
                              <td>{new Date(o.ordered_at).toLocaleDateString('kk-KZ', { timeZone: 'Asia/Almaty' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === 'logs' && (
                      <div className="logs-list">
                        {logs
                          .filter(l => (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.details || '').toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(l => (
                          <div key={l.id} className="log-item">
                            <span className="log-time">{new Date(l.created_at).toLocaleString('kk-KZ', { timeZone: 'Asia/Almaty' })}</span>
                            <span className="log-action"><strong>{l.action}</strong></span>
                            <p className="log-details"><strong>{l.user_name || 'Guest'}</strong>: {l.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

          {activeTab === 'seller-requests' && (
            <div className="view-wrapper" style={{ padding: '2rem' }}>
              <h1 className="view-title">Сатушы өтінімдері</h1>
              <p className="view-subtitle">Пайдаланушылардың сатушы болу өтінімдері</p>
              {loading ? <p>Жүктелуде...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  {sellerRequests.filter(r => (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Өтінімдер жоқ</p>
                  ) : sellerRequests.filter(r => (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(req => (
                    <div key={req.id} style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', margin: '0 0 4px 0' }}>{req.user_name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>{req.user_phone}</p>
                        {req.reason && <p style={{ fontSize: '0.9rem', margin: 0 }}>"{req.reason}"</p>}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>{new Date(req.created_at).toLocaleString('kk-KZ', { timeZone: 'Asia/Almaty' })}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {req.status === 'pending' ? (
                          <>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.5rem 1.2rem' }}
                              onClick={async () => {
                                await approveSellerRequest(req.id);
                                const data = await getAdminSellerRequests();
                                setSellerRequests(data);
                              }}
                            >✅ Бекіту</button>
                            <button
                              className="btn btn-outline-danger"
                              style={{ padding: '0.5rem 1.2rem' }}
                              onClick={async () => {
                                await rejectSellerRequest(req.id);
                                const data = await getAdminSellerRequests();
                                setSellerRequests(data);
                              }}
                            >❌ Бас тарту</button>
                          </>
                        ) : (
                          <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                            background: req.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: req.status === 'approved' ? '#22c55e' : '#ef4444'
                          }}>
                            {req.status === 'approved' ? '✅ Бекітілді' : '❌ Қабылданбады'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
    </div>
  );
};

export default AdminPanel;
