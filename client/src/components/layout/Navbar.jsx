import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../utils/api';
import styles from './Navbar.module.css';

const ROLE_LEVEL = { user: 0, staff: 1, admin: 2, superadmin: 3 };

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const navigate = useNavigate();

  const { data: logoSetting }    = useQuery({ queryKey: ['setting-logo'],    queryFn: () => api.get('/settings/logo').then(r => r.data),    staleTime: 10 * 60 * 1000 });
  const { data: faviconSetting } = useQuery({ queryKey: ['setting-favicon'], queryFn: () => api.get('/settings/favicon').then(r => r.data), staleTime: 10 * 60 * 1000 });

  // Dynamically update favicon
  useEffect(() => {
    if (!faviconSetting?.value) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = faviconSetting.value;
  }, [faviconSetting]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isAdminOrAbove = user && ROLE_LEVEL[user.role] >= ROLE_LEVEL.admin;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          {logoSetting?.value ? (
            <img src={logoSetting.value} alt="Constore" style={{ maxHeight: 40, maxWidth: 160, objectFit: 'contain' }} />
          ) : (
            <>
              <div className={styles.logoIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              Con<span>store</span>
            </>
          )}
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              {isAdminOrAbove && (
                <Link to="/admin" className={`btn btn-ghost`} style={{ fontSize: '0.82rem' }}>Admin Portal</Link>
              )}
              <Link to="/products" className={`btn btn-ghost`}>Products</Link>
              <Link to="/orders" className={`btn btn-ghost`}>Orders</Link>
              <Link to="/profile" className={`btn btn-ghost`}>Profile</Link>
              <button className={`btn btn-outline`} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-outline`}>Sign In</Link>
              <Link to="/register" className={`btn btn-primary`}>Register</Link>
            </>
          )}
          <Link to="/cart" className={styles.cartBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}