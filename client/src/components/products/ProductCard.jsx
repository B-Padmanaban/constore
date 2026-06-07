import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { user } = useAuthStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    await addToCart(product._id);
  };

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <Link to={`/products/${product.slug}`} className={styles.card}>
      {product.badge && <span className={`badge badge-${product.badge.toLowerCase().replace(' ', '')}`}>{product.badge}</span>}

      <div className={styles.imgWrap}>
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.name} className={styles.img} />
        ) : (
          <div className={styles.imgPlaceholder}>🧪</div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.catTag}>{product.category?.name}</div>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.rating}>
          <span className={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span className={styles.ratingCount}>({product.numReviews})</span>
        </div>

        <div className={styles.footer}>
          <div>
            <div className={styles.price}>₹{product.price.toLocaleString()}</div>
            {product.mrp && <div className={styles.mrp}>₹{product.mrp.toLocaleString()} <span className={styles.discount}>({discount}% off)</span></div>}
          </div>
          <button className={styles.addBtn} onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of Stock' : '+ Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
