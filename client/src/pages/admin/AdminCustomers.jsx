import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import styles from './Admin.module.css';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () =>
      api.get(`/users?role=user&search=${search}&page=${page}&limit=20`).then(r => r.data),
    keepPreviousData: true,
  });

  return (
    <div className={styles.page}>

      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>All registered customers on Constore</p>
        </div>
        <div className={styles.headerBadge}>
          <span className={styles.headerBadgeNum}>{data?.total ?? '—'}</span>
          <span className={styles.headerBadgeLabel}>Total Customers</span>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className={styles.card}>

        {/* TOOLBAR */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>
          <span className={styles.resultCount}>
            {data?.total || 0} {data?.total === 1 ? 'customer' : 'customers'}
          </span>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className={styles.loadingWrap}><div className="spinner" /></div>
        ) : !data?.users?.length ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <div className={styles.emptyTitle}>No customers found</div>
            <p className={styles.emptySub}>
              {search ? `No results matching "${search}"` : 'No customers have registered yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div className={styles.avatar}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.customerName}>{u.name}</div>
                            <span className={styles.muted}>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.phoneText}>{u.phone || '—'}</span></td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusPill} ${u.isActive ? styles.statusActive : styles.statusInactive}`}>
                          <span className={styles.statusDot} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageNavBtn}
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >← Prev</button>

                <div className={styles.pageNumbers}>
                  {[...Array(data.pages)].map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                </div>

                <button
                  className={styles.pageNavBtn}
                  disabled={page === data.pages}
                  onClick={() => setPage(p => p + 1)}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}