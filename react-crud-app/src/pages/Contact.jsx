import React from 'react';
import Card from '../components/Card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Хабарламаңыз жіберілді! Жақын арада байланысқа шығамыз.');
  };

  return (
    <main className="page-container">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Кері байланыс
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Бізбен байланысудың кез келген ыңғайлы жолын таңдаңыз.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card title="Байланыс мәліметтері">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--glass)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <Mail color="var(--primary)" size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</p>
                  <p>support@satu.kz</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--glass)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <Phone color="var(--secondary)" size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Телефон</p>
                  <p>+7 (700) 123-45-67</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--glass)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <MapPin color="var(--accent)" size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Мекен-жай</p>
                  <p>Алматы қ., Әл-Фараби даңғылы, 77/7</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Бізге жазыңыз">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Аты-жөніңіз</label>
              <input type="text" placeholder="Атыңызды енгізіңіз" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Электрондық пошта</label>
              <input type="email" placeholder="example@mail.com" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Хабарлама</label>
              <textarea placeholder="Сұрағыңызды қалдырыңыз..." rows="4" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)', resize: 'none' }}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} />
              Жіберу
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
};

export default Contact;
