import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import styles from './AdminLayout.module.css';

const ROLE_LEVEL = { user: 0, staff: 1, admin: 2, superadmin: 3 };

const NAV = [
  {
    group: 'Operations',
    items: [
      { to: '/admin',           label: 'Dashboard', icon: '📊', minRole: 'admin' },
      { to: '/admin/orders',    label: 'Orders',    icon: '📦', minRole: 'staff' },
      { to: '/admin/products',  label: 'Products',  icon: '🧪', minRole: 'admin' },
      { to: '/admin/customers', label: 'Customers', icon: '👥', minRole: 'admin' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: '⚙️', minRole: 'superadmin' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: logoSetting } = useQuery({
    queryKey: ['setting-logo'],
    queryFn: () => api.get('/settings/logo').then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const hasAccess = (minRole) => ROLE_LEVEL[user?.role] >= ROLE_LEVEL[minRole];
  const handleLogout = () => { logout(); navigate('/login'); };

  const ROLE_BADGE = {
    superadmin: { label: 'Super Admin', color: '#7c3aed' },
    admin:      { label: 'Admin',       color: '#1a3a5c' },
    staff:      { label: 'Staff',       color: '#0891b2' },
  };

  const badge = ROLE_BADGE[user?.role];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>

          {/* LOGO — dynamic if uploaded, fallback to text */}
          <NavLink to="/" className={styles.logo}>
            {logoSetting?.value ? (
              <div className={styles.logoImgWrap}>
                <img
                  src={logoSetting.value}
                  alt="Constore"
                  className={styles.logoImg}
                />
              </div>
            ) : (
              <>
                <div className={styles.logoIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                Con<span>store</span>
              </>
            )}
          </NavLink>

          {/* USER INFO */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              {badge && (
                <span className={styles.roleBadge} style={{ background: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map(section => {
            const visibleItems = section.items.filter(i => hasAccess(i.minRole));
            if (!visibleItems.length) return null;
            return (
              <div key={section.group} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>{section.group}</div>
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                    }
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <NavLink to="/" className={styles.backLink}>← Back to Store</NavLink>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}