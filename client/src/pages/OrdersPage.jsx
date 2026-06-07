import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import styles from './OrdersPage.module.css';

const STATUS_COLOR = { Pending: '#f59e0b', Confirmed: '#3b82f6', Processing: '#8b5cf6', Shipped: '#06b6d4', Delivered: '#10b981', Cancelled: '#ef4444' };

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/myorders').then(r => r.data),
  });

  if (isLoading) return <div className="spinner" />;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>My Orders</h1>

      {orders?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>No orders yet. <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 600 }}>Start shopping!</Link></p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={styles.statusBadge} style={{ background: `${STATUS_COLOR[order.orderStatus]}20`, color: STATUS_COLOR[order.orderStatus] }}>
                    {order.orderStatus}
                  </span>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>View Details</Link>
                </div>
              </div>
              <div className={styles.orderMeta}>
                <span>{order.orderItems.length} item(s)</span>
                <span>•</span>
                <span>₹{order.totalPrice.toLocaleString()}</span>
                <span>•</span>
                <span>{order.paymentMethod}</span>
                <span>•</span>
                <span style={{ color: order.isPaid ? 'var(--success)' : 'var(--error)' }}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
