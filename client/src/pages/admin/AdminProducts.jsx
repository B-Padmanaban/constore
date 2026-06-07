import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

const EMPTY_FORM = {
  name: '', description: '', category: '', price: '',
  mrp: '', stock: '', sku: '', unit: 'unit', badge: '', isFeatured: false,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get(`/products?page=${page}&limit=15`).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const { mutate: saveProduct, isLoading: saving } = useMutation({
    mutationFn: (payload) => {
      const fd = new FormData();
      fd.append('name',        payload.name);
      fd.append('description', payload.description);
      fd.append('category',    payload.category);
      fd.append('price',       payload.price);
      fd.append('stock',       payload.stock);
      fd.append('unit',        payload.unit);
      fd.append('isFeatured',  payload.isFeatured);
      if (payload.mrp)   fd.append('mrp',   payload.mrp);
      if (payload.sku)   fd.append('sku',   payload.sku);
      if (payload.badge) fd.append('badge', payload.badge);
      imageFiles.forEach(f => fd.append('images', f));

      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      return editing
        ? api.put(`/products/${editing}`, fd, cfg)
        : api.post('/products', fd, cfg);
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      qc.invalidateQueries(['admin-products']);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { toast.success('Product removed'); qc.invalidateQueries(['admin-products']); },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({
      name:        p.name,
      description: p.description,
      category:    p.category?._id || p.category || '',
      price:       p.price,
      mrp:         p.mrp || '',
      stock:       p.stock,
      sku:         p.sku || '',
      unit:        p.unit,
      badge:       p.badge || '',
      isFeatured:  p.isFeatured,
    });
    setImageFiles([]);
    setImagePreviews(p.images?.map(i => i.url) || []);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { toast.error('Max 5 images allowed'); return; }
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePreview = (idx) => {
    setImageFiles(p => p.filter((_, i) => i !== idx));
    setImagePreviews(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    saveProduct(form);
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title">Manage Products</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>

            <div className={styles.formFieldFull}>
              <label>Product Name *</label>
              <input required value={form.name} onChange={set('name')} placeholder="e.g. HydroSeal Pro X2" />
            </div>

            <div className={styles.formFieldFull}>
              <label>Description *</label>
              <textarea required rows={3} value={form.description} onChange={set('description')} placeholder="Product description..." />
            </div>

            <div className={styles.formFieldFull}>
              <label>Category *</label>
              <select required value={form.category} onChange={set('category')}>
                <option value="">-- Select Category --</option>
                {categories?.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div><label>Price (₹) *</label><input type="number" required min={0} value={form.price} onChange={set('price')} placeholder="1850" /></div>
            <div><label>MRP (₹)</label><input type="number" min={0} value={form.mrp} onChange={set('mrp')} placeholder="2200" /></div>
            <div><label>Stock *</label><input type="number" required min={0} value={form.stock} onChange={set('stock')} placeholder="100" /></div>
            <div><label>SKU</label><input value={form.sku} onChange={set('sku')} placeholder="HS-001" /></div>

            <div>
              <label>Unit</label>
              <select value={form.unit} onChange={set('unit')}>
                {['unit','kg','litre','bag','set'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label>Badge</label>
              <select value={form.badge} onChange={set('badge')}>
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Sale">Sale</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'end', paddingBottom: '0.6rem' }}>
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
              <label htmlFor="featured" style={{ margin: 0, fontWeight: 500 }}>Featured Product</label>
            </div>

            {/* IMAGE UPLOAD */}
            <div className={styles.formFieldFull}>
              <label>Product Images (max 5)</label>
              <div
                className={styles.dropZone}
                onClick={() => fileRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageChange({ target: { files: e.dataTransfer.files } }); }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                {imagePreviews.length === 0 ? (
                  <div className={styles.dropZoneInner}>
                    <div style={{ fontSize: '2rem' }}>📁</div>
                    <p>Click or drag images here</p>
                    <span>JPG, PNG, WEBP — max 5MB each</span>
                  </div>
                ) : (
                  <div className={styles.previewGrid}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} className={styles.previewItem}>
                        <img src={src} alt={`preview-${i}`} />
                        <button
                          type="button"
                          className={styles.removeImg}
                          onClick={e => { e.stopPropagation(); removePreview(i); }}
                        >✕</button>
                        {i === 0 && <span className={styles.mainBadge}>Main</span>}
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <div className={styles.addMoreImg}>
                        <span>+ Add more</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            </div>

          </form>
        </div>
      )}

      {isLoading ? <div className="spinner" /> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.products?.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: 'var(--section-bg)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🧪</div>
                    )}
                  </td>
                  <td><div className={styles.prodName}>{p.name}</div><span className={styles.muted}>{p.sku}</span></td>
                  <td>{p.category?.name || '—'}</td>
                  <td>₹{p.price.toLocaleString()}{p.mrp && <span className={styles.muted}> MRP ₹{p.mrp}</span>}</td>
                  <td><span style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>{p.stock}</span></td>
                  <td>{p.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#fdeee8', color: 'var(--error)', border: 'none' }} onClick={() => { if (window.confirm('Remove this product?')) deleteProduct(p._id); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {[...Array(data.pages)].map((_, i) => (
            <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} style={{ width: 38, height: 38, padding: 0 }} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}