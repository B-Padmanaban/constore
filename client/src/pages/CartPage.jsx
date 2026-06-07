import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, updateQty, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping  = subtotal >= 10000 ? 0 : 300;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '0.75rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse our products and add items to your cart.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Shopping Cart</h1>

      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map(({ product, qty }) => (
            <div key={product._id} className={styles.item}>
              <div className={styles.itemImg}>
                {product.images?.[0] ? <img src={product.images[0].url} alt={product.name} /> : <span>🧪</span>}
              </div>
              <div className={styles.itemInfo}>
                <Link to={`/products/${product.slug}`} className={styles.itemName}>{product.name}</Link>
                <div className={styles.itemUnit}>per {product.unit}</div>
                <div className={styles.itemPrice}>₹{product.price.toLocaleString()}</div>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.qtyWrap}>
                  <button className={styles.qtyBtn} onClick={() => updateQty(product._id, qty - 1)}>−</button>
                  <span className={styles.qty}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => updateQty(product._id, qty + 1)}>+</button>
                </div>
                <div className={styles.itemTotal}>₹{(product.price * qty).toLocaleString()}</div>
                <button className={styles.removeBtn} onClick={() => removeItem(product._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${shipping}`}</span>
          </div>
          <div className={styles.summaryRow}><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span><span>₹{total.toLocaleString()}</span>
          </div>
          {subtotal < 10000 && (
            <p className={styles.freeShipNote}>Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping!</p>
          )}
          <Link to="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`}>Proceed to Checkout →</Link>
          <Link to="/products" className={`btn btn-ghost ${styles.continueBtn}`}>← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
