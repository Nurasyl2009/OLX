import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../services/api';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register
  const [isReset, setIsReset] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      if (isReset) {
        const res = await forgotPassword({ email: formData.email });
        setSuccessMsg(res.message || 'Сілтеме поштаңызға жіберілді. Хатты тексеріңіз!');
        setTimeout(() => {
          setIsReset(false);
          setIsLogin(true);
          setSuccessMsg('');
        }, 3000);
      } else if (isLogin) {
        await login({ phone: formData.phone, password: formData.password });
        onClose();
      } else {
        await register(formData);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Қате кетті');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isReset ? 'Құпия сөзді қалпына келтіру' : isLogin ? 'Кіру' : 'Тіркелу'}</h2>
          <button className="btn btn-icon" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error ? <div key="error-msg" style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}><span>{error}</span></div> : null}
          {successMsg ? <div key="success-msg" style={{ color: '#22c55e', marginBottom: '1rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '8px' }}><span>{successMsg}</span></div> : null}

          {!isLogin && !isReset && (
            <div key="name-group" className="form-group">
              <label>Аты-жөні</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin && !isReset}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
          )}

          {(!isLogin || isReset) && (
            <div key="email-group" className="form-group">
              <label>Электрондық пошта (Email)</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required={!isLogin || isReset}
                maxLength={60}
                disabled={isLoading}
              />
            </div>
          )}

          {!isReset && (
            <div key="phone-group" className="form-group">
              <label>Телефон нөмірі</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={15}
                placeholder="+77771234567"
                disabled={isLoading}
              />
            </div>
          )}

          {!isReset && (
            <div key="password-group" className="form-group">
              <label>Құпиясөз (Password)</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={4}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Күте тұрыңыз...' : isReset ? 'Қалпына келтіру хатын жіберу' : isLogin ? 'Кіру' : 'Тіркелу'}
            </button>
          </div>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            {isReset ? (
              <button type="button" onClick={() => {setIsReset(false); setIsLogin(true);}} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} disabled={isLoading}>
                Кері қайту
              </button>
            ) : (
              <>
                {isLogin && (
                  <button type="button" onClick={() => setIsReset(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'block', width: '100%', marginBottom: '10px' }} disabled={isLoading}>
                    Құпия сөзді ұмыттыңыз ба?
                  </button>
                )}
                <span>{isLogin ? 'Аккаунтыңыз жоқ па?' : 'Аккаунтыңыз бар ма?'} </span>
                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} disabled={isLoading}>
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
