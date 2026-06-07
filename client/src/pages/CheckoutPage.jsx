import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping  = subtotal >= 10000 ? 0 : 300;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + shipping + tax;

  const f = (key) => ({ value: address[key], onChange: e => setAddress(p => ({ ...p, [key]: e.target.value })) });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const orderPayload = {
        orderItems: items.map(i => ({ product: i.product._id, name: i.product.name, image: i.product.images?.[0]?.url || '', price: i.product.price, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      };

      const { data: order } = await api.post('/orders', orderPayload);

      if (paymentMethod === 'Razorpay') {
        const { data: rzpData } = await api.post('/payment/create-order', { amount: total, orderId: order._id });
        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Constore',
          description: `Order #${order._id}`,
          order_id: rzpData.razorpayOrderId,
          handler: async (response) => {
            await api.post('/payment/verify', { ...response, orderId: order._id });
            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders/${order._id}`);
          },
          prefill: { name: user.name, email: user.email, contact: address.phone },
          theme: { color: '#1a3a5c' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Checkout</h1>

      <form onSubmit={handlePlaceOrder} className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.section}>
            <h2 className={styles.secTitle}>Shipping Address</h2>
            <div className={styles.fields}>
              <div className={styles.fieldFull}><label>Street Address</label><input required placeholder="123, MG Road, Block A" {...f('street')} /></div>
              <div><label>City</label><input required placeholder="Chennai" {...f('city')} /></div>
              <div><label>State</label><input required placeholder="Tamil Nadu" {...f('state')} /></div>
              <div><label>PIN Code</label><input required placeholder="600001" {...f('pincode')} /></div>
              <div><label>Phone</label><input required placeholder="+91 98765 43210" {...f('phone')} /></div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.secTitle}>Payment Method</h2>
            <div className={styles.paymentOptions}>
              {['Razorpay', 'COD'].map(method => (
                <label key={method} className={`${styles.payOption} ${paymentMethod === method ? styles.payActive : ''}`}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <span>{method === 'COD' ? '💵 Cash on Delivery' : '💳 Pay Online (Razorpay)'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.summaryCard}>
            <h2 className={styles.secTitle}>Order Summary</h2>
            {items.map(({ product, qty }) => (
              <div key={product._id} className={styles.orderItem}>
                <span className={styles.orderItemName}>{product.name} × {qty}</span>
                <span>₹{(product.price * qty).toLocaleString()}</span>
              </div>
            ))}
            <div className={styles.divider} />
            <div className={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className={styles.summaryRow}><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1.25rem' }} disabled={loading}>
              {loading ? 'Processing...' : `Place Order — ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
