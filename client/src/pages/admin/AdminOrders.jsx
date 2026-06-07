import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

const STATUSES = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-list', page],
    queryFn: () => api.get(`/orders?page=${page}&limit=15`).then(r => r.data),
    keepPreviousData: true,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['admin-orders-list']); },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Manage Orders</h1>

      {isLoading ? <div className="spinner" /> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Total</th><th>Paid</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map(order => (
                <tr key={order._id}>
                  <td><span className={styles.mono}>#{order._id.slice(-8).toUpperCase()}</span></td>
                  <td>{order.user?.name}<br /><span className={styles.muted}>{order.user?.email}</span></td>
                  <td>₹{order.totalPrice.toLocaleString()}</td>
                  <td><span style={{ color: order.isPaid ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>{order.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={order.orderStatus}
                      onChange={e => updateStatus({ id: order._id, status: e.target.value })}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className={styles.muted}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
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
