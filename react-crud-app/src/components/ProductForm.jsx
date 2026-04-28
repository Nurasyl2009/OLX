import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{product ? 'Тауарды өзгерту' : 'Жаңа тауар'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Тауар атауы</label>
            <input 
              id="product-name-input"
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="мысалы: iPhone 13"
            />
          </div>
          <div className="form-group">
            <label>Бағасы (₸)</label>
            <input 
              name="price" 
              type="number"
              required 
              value={formData.price} 
              onChange={handleChange} 
              placeholder="мысалы: 150000"
            />
          </div>
          <div className="form-group">
            <label>Сурет сілтемесі (URL)</label>
            <input 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              placeholder="мысалы: https://example.com/image.jpg"
            />
          </div>
          <div className="form-group">
            <label>Күйі</label>
            <select name="status" value={formData.status} onChange={handleChange}>
                <option value="available">Available (Сатылымда)</option>
                <option value="sold">Sold (Сатылды)</option>
                <option value="pending">Pending (Күтілуде)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Сипаттамасы</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button id="cancel-form-btn" type="button" className="btn" onClick={onClose} style={{ color: 'var(--text-muted)' }}>Бас тарту</button>
            <button id="submit-product-btn" type="submit" className="btn btn-primary">{product ? 'Сақтау' : 'Қосу'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
