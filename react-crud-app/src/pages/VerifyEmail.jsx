import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Поштаңыз расталуда...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      verifyEmail(token)
        .then((res) => {
          setStatus('success');
          setMessage(res.message);
          // Redirect to login or home after 3 seconds
          setTimeout(() => navigate('/'), 3000);
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Растау кезінде қате кетті');
        });
    } else {
      setStatus('error');
      setMessage('Растау коды табылмады');
    }
  }, [location, navigate]);

  return (
    <div className="verify-email-page" style={{ textAlign: 'center', padding: '50px' }}>
      <div className={`status-icon ${status}`} style={{ fontSize: '50px', marginBottom: '20px' }}>
        {status === 'verifying' && '⏳'}
        {status === 'success' && '✅'}
        {status === 'error' && '❌'}
      </div>
      <h2>{message}</h2>
      {status === 'success' && <p>Сізді автоматты түрде басты бетке бағыттаймыз...</p>}
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/')} 
        style={{ marginTop: '20px' }}
      >
        Басты бетке өту
      </button>
    </div>
  );
};

export default VerifyEmail;
