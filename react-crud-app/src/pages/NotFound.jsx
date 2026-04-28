import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <main style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <h1 style={{ fontSize: '8rem', margin: 0, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
        404
      </h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Мұндай бет табылмады</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Кешіріңіз, сіз іздеген бет жоқ немесе басқа адрес бойынша орналасқан.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Home size={20} />
        Басқа бетке өту
      </Link>
    </main>
  );
};

export default NotFound;
