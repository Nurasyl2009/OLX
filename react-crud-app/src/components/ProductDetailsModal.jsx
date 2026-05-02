import React, { useState, useEffect } from 'react';
import { X, Star, Send, ShoppingBag, User, Calendar, MessageCircle, TrendingUp } from 'lucide-react';
import { getReviews, addReview, incrementView } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetailsModal = ({ product, onClose }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    // Increment view count for the product when modal opens
    incrementView(product.id).catch(err => console.error('View increment failed', err));
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews(product.id);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await addReview(product.id, { rating, comment });
      setComment('');
      setRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      await fetchReviews();
    } catch (err) {
      setSubmitError('Пікір қосу мүмкін болмады. Қайталап көріңіз.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = Number(product.avg_rating || 0).toFixed(1);
  const reviewsCount = product.reviews_count || reviews.length || 0;

  const ratingLabels = ['', 'Нашар', 'Қанағаттанарлық', 'Жақсы', 'Өте жақсы', 'Керемет'];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .pdm-tab { transition: all 0.2s ease; border-bottom: 2px solid transparent; }
        .pdm-tab:hover { color: var(--primary, #6366f1) !important; }
        .pdm-tab.active { color: var(--primary, #6366f1) !important; border-bottom-color: var(--primary, #6366f1) !important; }
        .pdm-star { transition: transform 0.15s ease, filter 0.15s ease; cursor: pointer; }
        .pdm-star:hover { transform: scale(1.3); filter: drop-shadow(0 0 6px #f59e0b); }
        .pdm-review-card { transition: box-shadow 0.2s ease; }
        .pdm-review-card:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.12); }
        .pdm-submit-btn { transition: all 0.2s ease; position: relative; overflow: hidden; }
        .pdm-submit-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .pdm-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .pdm-scrollbar::-webkit-scrollbar { width: 6px; }
        .pdm-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pdm-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
      `}</style>

      <div
        className="pdm-scrollbar"
        style={{
          background: 'linear-gradient(145deg, #1a1b2e 0%, #16213e 50%, #0f3460 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(26,27,46,0.95)',
          backdropFilter: 'blur(20px)',
          padding: '1.25rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingBag size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Тауар туралы</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(148,163,184,0.8)' }}>Толық ақпарат</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#94a3b8', cursor: 'pointer',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Hero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', padding: '2rem' }}>
          {/* Image */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '280px' }}>
            <img
              src={product.image_url?.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/400x280?text=Сурет+жоқ'; }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)'
            }} />
            {/* Category badge */}
            {product.category && (
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 600
              }}>
                {product.category}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
              {product.title}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Price */}
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '16px', padding: '1rem 1.25rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              width: 'fit-content'
            }}>
              <TrendingUp size={18} color="#22c55e" />
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22c55e', letterSpacing: '-0.5px' }}>
                {Number(product.price).toLocaleString()} ₸
              </span>
            </div>

            {/* Rating overview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '12px', padding: '6px 14px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1rem' }}>{avgRating}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {reviewsCount} пікір
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} fill={s <= Math.round(avgRating) ? '#f59e0b' : 'none'} color={s <= Math.round(avgRating) ? '#f59e0b' : '#334155'} />
                ))}
              </div>
            </div>

            {/* Seller */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={15} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Сатушы</p>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{product.seller_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          padding: '0 2rem',
        }}>
          {[
            { id: 'reviews', label: 'Пікірлер', icon: <MessageCircle size={16} />, count: reviewsCount },
          ].map(tab => (
            <button
              key={tab.id}
              className={`pdm-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none',
                padding: '1rem 1.5rem',
                color: activeTab === tab.id ? '#6366f1' : '#64748b',
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.15)',
                  color: activeTab === tab.id ? '#6366f1' : '#94a3b8',
                  borderRadius: '20px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews Section */}
        <div style={{ padding: '2rem' }}>

          {/* Add Review Form */}
          {user ? (
            <form onSubmit={handleSubmitReview} style={{
              marginBottom: '2rem',
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '20px',
              padding: '1.5rem',
            }}>
              <h4 style={{ margin: '0 0 1.25rem 0', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                ✍️ Өз пікіріңізді қалдырыңыз
              </h4>

              {/* Star Rating */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Бағаңыз:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <span
                      key={s}
                      className="pdm-star"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoveredRating(s)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        size={28}
                        fill={s <= (hoveredRating || rating) ? '#f59e0b' : 'none'}
                        color={s <= (hoveredRating || rating) ? '#f59e0b' : '#334155'}
                        strokeWidth={1.5}
                      />
                    </span>
                  ))}
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#f59e0b',
                    fontWeight: 600,
                    minWidth: '100px'
                  }}>
                    {ratingLabels[hoveredRating || rating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <textarea
                placeholder="Тауар туралы пікіріңізді жазыңыз..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'white',
                  fontSize: '0.95rem',
                  minHeight: '110px',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.2)'; }}
              />

              {/* Error / Success */}
              {submitError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  ⚠️ {submitError}
                </div>
              )}
              {submitSuccess && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  ✅ Пікіріңіз сәтті қосылды!
                </div>
              )}

              <button
                type="submit"
                className="pdm-submit-btn"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Send size={16} />
                {submitting ? 'Жіберілуде...' : 'Пікір қалдыру'}
              </button>
            </form>
          ) : (
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              borderRadius: '20px',
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.15)',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.9rem'
            }}>
              <MessageCircle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>Пікір қалдыру үшін жүйеге кіріңіз</p>
            </div>
          )}

          {/* Reviews List */}
          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              💬 Барлық пікірлер
            </h4>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.25rem',
                    animation: 'shimmer 1.5s infinite',
                    height: '90px'
                  }} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '3rem 1rem',
                color: '#475569', fontSize: '0.95rem'
              }}>
                <Star size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p style={{ margin: 0 }}>Әзірше пікірлер жоқ. Бірінші болыңыз!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(r => (
                  <div
                    key={r.id}
                    className="pdm-review-card"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: `hsl(${(r.user_name?.charCodeAt(0) || 0) * 15}, 60%, 40%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'white', fontSize: '0.85rem', flexShrink: 0
                        }}>
                          {r.user_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.875rem' }}>{r.user_name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={11} fill={s <= r.rating ? '#f59e0b' : 'none'} color={s <= r.rating ? '#f59e0b' : '#334155'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#475569', fontSize: '0.75rem' }}>
                        <Calendar size={11} />
                        {new Date(r.created_at).toLocaleDateString('kk-KZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
