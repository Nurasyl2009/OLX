import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register
  const [isReset, setIsReset] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isReset) {
        const { forgotPassword } = await import('../services/api');
        const res = await forgotPassword({ email: formData.email });
        alert(res.message || 'Сілтеме email-ге жіберілді!');
        setIsReset(false);
        setIsLogin(true);
      } else if (isLogin) {
        await login({ phone: formData.phone, password: formData.password });
        onClose();
      } else {
        await register(formData);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Қате кетті');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isReset ? 'Құпия сөзді қалпына келтіру' : isLogin ? 'Кіру' : 'Тіркелу'}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          {!isLogin && !isReset && (
            <div className="form-group">
              <label>Аты-жөні</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin && !isReset}
              />
            </div>
          )}

          {(!isLogin || isReset) && (
            <div className="form-group">
              <label>Электрондық пошта (Email)</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required={!isLogin || isReset}
              />
            </div>
          )}

          {!isReset && (
            <div className="form-group">
              <label>Телефон нөмірі</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {!isReset && (
            <div className="form-group">
              <label>Құпиясөз (Password)</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {isReset ? 'Қалпына келтіру' : isLogin ? 'Кіру' : 'Тіркелу'}
            </button>
          </div>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            {isReset ? (
              <button type="button" onClick={() => {setIsReset(false); setIsLogin(true);}} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                Кері қайту
              </button>
            ) : (
              <>
                {isLogin && (
                  <button type="button" onClick={() => setIsReset(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'block', width: '100%', marginBottom: '10px' }}>
                    Құпия сөзді ұмыттыңыз ба?
                  </button>
                )}
                {isLogin ? 'Аккаунтыңыз жоқ па?' : 'Аккаунтыңыз бар ма?'} 
                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                  {isLogin ? 'Тіркелу' : 'Кіру'}
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
