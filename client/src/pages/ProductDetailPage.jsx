import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const addToCart = useCartStore(s => s.addToCart);
  const { user } = useAuthStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
  });

  if (isLoading) return <div className="spinner" />;
  if (!product)  return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found.</div>;

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className={styles.breadcrumb}>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className={styles.layout}>
        {/* IMAGES */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg].url} alt={product.name} />
            ) : (
              <div className={styles.imgPlaceholder}>🧪</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className={styles.info}>
          {product.badge && <span className={`badge badge-${product.badge.toLowerCase().replace(' ','')}`}>{product.badge}</span>}
          <div className={styles.catTag}>{product.category?.name}</div>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.rating}>
            <span className={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className={styles.ratingCount}>{product.numReviews} reviews</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price.toLocaleString()}</span>
            <span className={styles.unit}>/ {product.unit}</span>
            {product.mrp && (
              <>
                <span className={styles.mrp}>₹{product.mrp.toLocaleString()}</span>
                <span className={styles.discountTag}>{discount}% OFF</span>
              </>
            )}
          </div>

          {product.sku && <p className={styles.sku}>SKU: {product.sku}</p>}

          <p className={styles.desc}>{product.description}</p>

          {product.specifications?.length > 0 && (
            <div className={styles.specs}>
              <h3 className={styles.specsTitle}>Specifications</h3>
              <table className={styles.specsTable}>
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i}>
                      <td className={styles.specKey}>{s.key}</td>
                      <td className={styles.specVal}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.actions}>
            <div className={styles.qtyWrap}>
              <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className={styles.qty}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '1rem', padding: '0.75rem' }}
              disabled={product.stock === 0}
              onClick={() => {
                if (!user) { window.location.href = '/login'; return; }
                addToCart(product._id, qty);
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className={styles.stockInfo}>
            {product.stock > 0
              ? <span style={{ color: 'var(--success)' }}>✅ In Stock ({product.stock} available)</span>
              : <span style={{ color: 'var(--error)' }}>❌ Out of Stock</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
