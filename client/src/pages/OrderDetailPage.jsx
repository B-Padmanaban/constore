import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import styles from './OrderDetailPage.module.css';

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="spinner" />;
  if (!order) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Order not found.</div>;

  const stepIdx = STEPS.indexOf(order.orderStatus);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <Link to="/orders" className={styles.back}>← Back to Orders</Link>
      <h1 className="section-title" style={{ margin: '1rem 0 2rem' }}>Order #{order._id.slice(-8).toUpperCase()}</h1>

      {/* STATUS STEPPER */}
      {order.orderStatus !== 'Cancelled' && (
        <div className={styles.stepper}>
          {STEPS.map((step, i) => (
            <div key={step} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${i <= stepIdx ? styles.stepDone : ''}`}>{i < stepIdx ? '✓' : i + 1}</div>
              <div className={styles.stepLabel}>{step}</div>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < stepIdx ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <div>
          {/* ITEMS */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Order Items</h2>
            {order.orderItems.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemImg}>
                  {item.image ? <img src={item.image} alt={item.name} /> : '🧪'}
                </div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemQty}>× {item.qty}</div>
                <div className={styles.itemPrice}>₹{(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* SHIPPING */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Shipping Address</h2>
            <p className={styles.address}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className={styles.card} style={{ alignSelf: 'start' }}>
          <h2 className={styles.cardTitle}>Payment Summary</h2>
          <div className={styles.summaryRow}><span>Subtotal</span><span>₹{order.itemsPrice.toLocaleString()}</span></div>
          <div className={styles.summaryRow}><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
          <div className={styles.summaryRow}><span>GST</span><span>₹{order.taxPrice.toLocaleString()}</span></div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span></div>
          <div className={styles.payInfo}>
            <div><span className={styles.payLabel}>Method:</span> {order.paymentMethod}</div>
            <div><span className={styles.payLabel}>Status:</span>
              <span style={{ color: order.isPaid ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                {order.isPaid ? ` Paid on ${new Date(order.paidAt).toLocaleDateString('en-IN')}` : ' Not Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
