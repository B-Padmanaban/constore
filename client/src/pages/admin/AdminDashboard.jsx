import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [productSearch, setProductSearch] = useState('');

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders?limit=5').then(r => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => api.get('/products?limit=1').then(r => r.data),
  });

  const { data: heroSetting } = useQuery({
    queryKey: ['setting-hero-product'],
    queryFn: () => api.get('/settings/hero_product').then(r => r.data),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['product-search', productSearch],
    queryFn: () => api.get(`/products?keyword=${productSearch}&limit=8`).then(r => r.data),
    enabled: productSearch.length > 1,
  });

  const { data: allProducts } = useQuery({
    queryKey: ['products-picker'],
    queryFn: () => api.get('/products?limit=20').then(r => r.data),
  });

  const { mutate: setHeroProduct } = useMutation({
    mutationFn: (productId) => api.put('/settings/hero_product', { value: productId }),
    onSuccess: () => {
      toast.success('Hero product updated');
      qc.invalidateQueries(['setting-hero-product']);
    },
  });

  const totalRevenue = orders?.orders?.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0) || 0;

  const displayProducts = productSearch.length > 1
    ? searchResults?.products
    : allProducts?.products;

  const currentHeroId = heroSetting?.value;
  const currentHero = allProducts?.products?.find(p => p._id === currentHeroId);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Products', value: products?.total || 0,              icon: '📦', link: '/admin/products' },
          { label: 'Total Orders',   value: orders?.total  || 0,              icon: '🛒', link: '/admin/orders'   },
          { label: 'Revenue (Paid)', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', link: '/admin/orders' },
        ].map(s => (
          <Link to={s.link} key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div className={styles.quickLinks} style={{ marginBottom: '2.5rem' }}>
        <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
        <Link to="/admin/orders"   className="btn btn-outline">Manage Orders</Link>
      </div>

      {/* HERO PRODUCT PICKER */}
      <div className={styles.heroPickerCard}>
        <h2 className={styles.heroPickerTitle}>🏠 Homepage Hero Product</h2>
        <p className={styles.heroPickerSub}>Select which product is featured in the homepage hero section.</p>

        {/* CURRENT SELECTION PREVIEW */}
        {currentHero ? (
          <div className={styles.currentHero}>
            <div className={styles.currentHeroLabel}>Currently Selected</div>
            <div className={styles.currentHeroInner}>
              <div className={styles.currentHeroImg}>
                {currentHero.images?.[0]
                  ? <img src={currentHero.images[0].url} alt={currentHero.name} />
                  : <span>🧪</span>
                }
              </div>
              <div className={styles.currentHeroInfo}>
                <div className={styles.currentHeroName}>{currentHero.name}</div>
                <div className={styles.currentHeroCat}>{currentHero.category?.name}</div>
                <div className={styles.currentHeroPrice}>₹{currentHero.price?.toLocaleString()} / {currentHero.unit}</div>
              </div>
              {/* Mini hero preview */}
              <div className={styles.heroPreview}>
                <div className={styles.heroPreviewLabel}>Preview</div>
                <div className={styles.heroPreviewCard}>
                  <div className={styles.heroPreviewImg}>
                    {currentHero.images?.[0]
                      ? <img src={currentHero.images[0].url} alt={currentHero.name} />
                      : <span style={{ fontSize: '2.5rem' }}>🧪</span>
                    }
                  </div>
                  <div className={styles.heroPreviewName}>{currentHero.name}</div>
                  <div className={styles.heroPreviewCat}>{currentHero.category?.name}</div>
                  <div className={styles.heroPreviewPrice}>₹{currentHero.price?.toLocaleString()} / {currentHero.unit}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noHero}>No hero product selected — homepage shows static placeholder.</div>
        )}

        {/* SEARCH + PICK */}
        <div className={styles.pickerSearch}>
          <input
            type="text"
            placeholder="Search products to set as hero..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className={styles.pickerSearchInput}
          />
        </div>

        <div className={styles.pickerGrid}>
          {displayProducts?.map(p => (
            <button
              key={p._id}
              className={`${styles.pickerItem} ${p._id === currentHeroId ? styles.pickerItemActive : ''}`}
              onClick={() => setHeroProduct(p._id)}
            >
              <div className={styles.pickerImg}>
                {p.images?.[0]
                  ? <img src={p.images[0].url} alt={p.name} />
                  : <span>🧪</span>
                }
              </div>
              <div className={styles.pickerName}>{p.name}</div>
              <div className={styles.pickerPrice}>₹{p.price?.toLocaleString()}</div>
              {p._id === currentHeroId && <div className={styles.pickerCheck}>✓ Selected</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}