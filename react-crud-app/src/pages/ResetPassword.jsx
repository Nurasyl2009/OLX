import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordConfirm } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Құпиясөздер сәйкес емес');
      return;
    }
    try {
      const res = await resetPasswordConfirm(token, newPassword);
      setMessage(res.message || 'Құпия сөзіңіз жаңартылды');
      // Redirect to login after short delay
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Қате кетті');
    }
  };

  if (!token) {
    return <div style={{ padding: '2rem' }}>Қате: токен берілмеді.</div>;
  }

  return (
    <div className="reset-password-page" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Құпия сөзді қалпына келтіру</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Жаңа құпия сөз</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Құпия сөзді қайта енгізіңіз</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Құпия сөзді өзгерту
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
