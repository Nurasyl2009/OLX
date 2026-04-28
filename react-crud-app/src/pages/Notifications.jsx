import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationsAsRead, markOneNotificationRead } from '../services/api';

const typeIcons = {
  order: '🛒',
  approved: '✅',
  rejected: '❌',
  seller_request: '📋',
  info: 'ℹ️',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleMarkOneRead = async (id) => {
    await markOneNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <Link to="/" className="notif-back-btn"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="notif-page-title"><Bell size={28} /> Хабарламалар</h1>
          <p className="notif-page-sub">{unreadCount > 0 ? `${unreadCount} оқылмаған хабарлама` : 'Барлығы оқылған'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Барлығын оқу
          </button>
        )}
      </div>

      <div className="notif-filters">
        <button className={`notif-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Барлығы ({notifications.length})
        </button>
        <button className={`notif-filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Оқылмаған ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="notif-loading">
          <div className="notif-spinner"></div>
          <p>Жүктелуде...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="notif-empty">
          <Bell size={48} strokeWidth={1} />
          <p>Хабарламалар жоқ</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map(notif => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => !notif.is_read && handleMarkOneRead(notif.id)}
            >
              <div className="notif-icon-wrap">
                <span className="notif-type-icon">{typeIcons[notif.type] || '📬'}</span>
              </div>
              <div className="notif-content">
                {notif.title && <p className="notif-title-text">{notif.title}</p>}
                <p className="notif-message">{notif.message}</p>
                <span className="notif-time">{new Date(notif.created_at).toLocaleString('kk-KZ')}</span>
              </div>
              <div className="notif-status">
                {!notif.is_read ? (
                  <span className="notif-dot"></span>
                ) : (
                  <Check size={16} className="notif-check" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
