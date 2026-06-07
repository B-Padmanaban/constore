import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password });
      setAuth(data, data.token);
      toast.success(`Welcome to Constore, ${data.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value }) ) });

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>Constore</div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.sub}>Join thousands of contractors on Constore</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}><label>Full Name</label><input required placeholder="John Builder" {...f('name')} /></div>
          <div className={styles.field}><label>Email Address</label><input type="email" required placeholder="you@example.com" {...f('email')} /></div>
          <div className={styles.field}><label>Phone Number</label><input type="tel" placeholder="+91 98765 43210" {...f('phone')} /></div>
          <div className={styles.field}><label>Password</label><input type="password" required placeholder="Min 6 characters" {...f('password')} /></div>
          <div className={styles.field}><label>Confirm Password</label><input type="password" required placeholder="Re-enter password" {...f('confirm')} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
