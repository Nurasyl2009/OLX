import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Tag, DollarSign, AlignLeft, Image as ImageIcon, Package, Info, Plus, Trash2 } from 'lucide-react';
import { uploadImage, addProductImage, deleteProductImage, getProductImages } from '../services/api';

const ProductForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    image_url: '',
    category: 'Басқа',
    status: 'available'
  });
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      // Load existing gallery images when editing
      getProductImages(product.id).then(imgs => setGalleryImages(imgs)).catch(() => {});
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: data.url }));
    } catch (err) {
      alert("Сурет жүктеу кезінде қате кетті");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease', padding: '1rem' }}>
      <div className="modal-content glass-effect pdm-scrollbar" style={{ maxWidth: '600px', width: '100%', padding: '2rem', borderRadius: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {product ? 'Тауарды өзгерту' : 'Жаңа тауар қосу'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Сатылымға шығаратын тауардың мәліметтерін толтырыңыз
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Image Upload Area */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>
              <ImageIcon size={18} /> Сурет жүктеу
            </label>
            
            <div 
              style={{
                border: '2px dashed rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: formData.image_url ? '1rem' : '3rem 1rem',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.2)',
                cursor: uploading ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}
              onClick={() => !uploading && fileInputRef.current.click()}
              className="upload-area-hover"
            >
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              
              {uploading ? (
                <div style={{ color: 'var(--primary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner"></span> Жүктелуде...
                </div>
              ) : formData.image_url ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '12px' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', color: 'white' }}>Басқа сурет таңдау</div>
                </div>
              ) : (
                <>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Суретті таңдау үшін басыңыз</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG немесе WEBP</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Title */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag size={16} /> Атауы</label>
              <input 
                name="title" 
                required 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="iPhone 13 Pro"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Price */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} /> Бағасы (₸)</label>
              <input 
                name="price" 
                type="number"
                required 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="150000"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} /> Категория</label>
              <select name="category" value={formData.category} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="Электроника">Электроника</option>
                  <option value="Киім">Киім</option>
                  <option value="Көлік">Көлік</option>
                  <option value="Үй жабдықтары">Үй жабдықтары</option>
                  <option value="Басқа">Басқа</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={16} /> Күйі</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="available">Сатылымда (Available)</option>
                  <option value="sold">Сатылды (Sold)</option>
                  <option value="pending">Күтілуде (Pending)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlignLeft size={16} /> Сипаттамасы</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="4"
              placeholder="Тауар туралы толық мәлімет жазыңыз..."
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', resize: 'vertical' }}
            />
          </div>

          {/* Gallery Images (only shown when editing an existing product) */}
          {product?.id && (
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>
                <ImageIcon size={18} /> Қосымша суреттер (галерея)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {galleryImages.map(img => (
                  <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(99,102,241,0.3)' }}>
                    <img src={img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000${img.image_url}`} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteProductImage(product.id, img.id);
                        setGalleryImages(prev => prev.filter(i => i.id !== img.id));
                      }}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                    style={{ width: '80px', height: '80px', borderRadius: '10px', border: '2px dashed rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)', color: '#6366f1', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.7rem' }}
                  >
                    {galleryUploading ? '...' : <><Plus size={20} /><span>Сурет</span></>}
                  </button>
                )}
                <input
                  type="file" accept="image/*" ref={galleryInputRef} style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setGalleryUploading(true);
                    try {
                      const newImg = await addProductImage(product.id, file);
                      setGalleryImages(prev => [...prev, newImg]);
                    } catch (err) {
                      alert('Сурет жүктеу кезінде қате кетті');
                    } finally {
                      setGalleryUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Максимум 5 сурет. Барлық суреттер тауар бетінде галерея ретінде көрсетіледі.</p>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '0', display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }}>Бас тарту</button>
            <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              {product ? 'Өзгерістерді сақтау' : 'Тауарды жариялау'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
