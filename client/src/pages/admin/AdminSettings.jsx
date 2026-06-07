import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

const TABS = ['Appearance', 'Store Info', 'User Management'];

export default function AdminSettings() {
  const [tab, setTab] = useState('Appearance');
  const qc = useQueryClient();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSub}>Super Admin access only</p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Appearance'      && <AppearanceTab qc={qc} />}
      {tab === 'Store Info'      && <StoreInfoTab  qc={qc} />}
      {tab === 'User Management' && <UserMgmtTab   qc={qc} />}
    </div>
  );
}

/* ─────────────────────────────────────
   APPEARANCE TAB
───────────────────────────────────── */
function AppearanceTab({ qc }) {
  const logoRef    = useRef();
  const faviconRef = useRef();
  const [logoPreview,    setLogoPreview]    = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const { data: logoSetting }    = useQuery({ queryKey: ['setting-logo'],    queryFn: () => api.get('/settings/logo').then(r => r.data)    });
  const { data: faviconSetting } = useQuery({ queryKey: ['setting-favicon'], queryFn: () => api.get('/settings/favicon').then(r => r.data) });

  const uploadAndSave = async (file, settingKey, invalidateKey) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/settings/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.put(`/settings/${settingKey}`, { value: data.url });
      toast.success(`${settingKey === 'logo' ? 'Logo' : 'Favicon'} updated`);
      qc.invalidateQueries([invalidateKey]);
      if (settingKey === 'logo')    setLogoPreview(null);
      if (settingKey === 'favicon') setFaviconPreview(null);
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'logo')    setLogoPreview({ file, url });
    if (type === 'favicon') setFaviconPreview({ file, url });
  };

  const removeSetting = async (key, invalidateKey) => {
    await api.put(`/settings/${key}`, { value: null });
    qc.invalidateQueries([invalidateKey]);
    toast.success('Removed');
  };

  return (
    <div className={styles.settingsGrid}>

      {/* ── LOGO ── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Navbar Logo</h2>
        <p className={styles.cardSub}>
          Replaces the text logo in the navbar.<br />
          Recommended: PNG with transparent background, max 200×60px.
        </p>

        <div className={styles.assetRow}>
          <div className={styles.assetCurrent}>
            <div className={styles.assetLabel}>Current</div>
            <div className={styles.logoPreviewBox}>
              {logoSetting?.value
                ? <img src={logoSetting.value} alt="Logo" style={{ maxHeight: 48, maxWidth: 180, objectFit: 'contain' }} />
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Text logo (default)</span>
              }
            </div>
          </div>

          <div className={styles.assetUpload}>
            <div className={styles.assetLabel}>Upload New</div>
            <div className={styles.dropZone} onClick={() => logoRef.current.click()}>
              <input
                ref={logoRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                style={{ display: 'none' }}
                onChange={e => handleFile(e, 'logo')}
              />
              {logoPreview
                ? <img src={logoPreview.url} alt="preview" style={{ maxHeight: 48, maxWidth: 180, objectFit: 'contain' }} />
                : (
                  <div className={styles.dropZoneInner}>
                    <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    <span>Click to upload</span>
                  </div>
                )
              }
            </div>
            {logoPreview && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => uploadAndSave(logoPreview.file, 'logo', 'setting-logo')}
                >
                  Save Logo
                </button>
                <button className="btn btn-ghost" onClick={() => setLogoPreview(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {logoSetting?.value && (
          <button
            className={styles.removeBtn}
            onClick={() => removeSetting('logo', 'setting-logo')}
          >
            Remove logo (revert to text)
          </button>
        )}
      </div>

      {/* ── FAVICON ── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Favicon</h2>
        <p className={styles.cardSub}>
          Shown in browser tabs and bookmarks.<br />
          Recommended: PNG or ICO, 32×32px or 64×64px.
        </p>

        <div className={styles.assetRow}>
          <div className={styles.assetCurrent}>
            <div className={styles.assetLabel}>Current</div>
            <div className={styles.faviconPreviewBox}>
              {faviconSetting?.value
                ? <img src={faviconSetting.value} alt="Favicon" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                : <span style={{ fontSize: '2rem' }}>🏗️</span>
              }
            </div>
          </div>

          <div className={styles.assetUpload}>
            <div className={styles.assetLabel}>Upload New</div>
            <div className={styles.dropZone} onClick={() => faviconRef.current.click()}>
              <input
                ref={faviconRef}
                type="file"
                accept="image/png,image/x-icon,image/jpeg"
                style={{ display: 'none' }}
                onChange={e => handleFile(e, 'favicon')}
              />
              {faviconPreview
                ? <img src={faviconPreview.url} alt="preview" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                : (
                  <div className={styles.dropZoneInner}>
                    <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    <span>Click to upload</span>
                  </div>
                )
              }
            </div>
            {faviconPreview && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => uploadAndSave(faviconPreview.file, 'favicon', 'setting-favicon')}
                >
                  Save Favicon
                </button>
                <button className="btn btn-ghost" onClick={() => setFaviconPreview(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {faviconSetting?.value && (
          <button
            className={styles.removeBtn}
            onClick={() => removeSetting('favicon', 'setting-favicon')}
          >
            Remove favicon (revert to default)
          </button>
        )}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────
   STORE INFO TAB
───────────────────────────────────── */
function StoreInfoTab({ qc }) {
  const { data: storeInfo } = useQuery({
    queryKey: ['setting-store-info'],
    queryFn: () => api.get('/settings/store_info').then(r => r.data),
  });

  const [form, setForm] = useState(null);

  const info = form ?? storeInfo?.value ?? {
    name: 'Constore', tagline: '', email: '', phone: '', address: '', gst: '',
  };

  const { mutate: save, isLoading } = useMutation({
    mutationFn: () => api.put('/settings/store_info', { value: info }),
    onSuccess: () => {
      toast.success('Store info saved');
      qc.invalidateQueries(['setting-store-info']);
    },
    onError: () => toast.error('Save failed'),
  });

  const set = (key) => (e) => setForm(p => ({ ...(p ?? info), [key]: e.target.value }));

  return (
    <div className={styles.card} style={{ maxWidth: 580 }}>
      <h2 className={styles.cardTitle}>Store Information</h2>
      <p className={styles.cardSub}>Used in invoices, confirmation emails and footer.</p>

      <div className={styles.formGrid}>
        <div className={styles.formFieldFull}>
          <label>Store Name</label>
          <input value={info.name} onChange={set('name')} placeholder="Constore" />
        </div>
        <div className={styles.formFieldFull}>
          <label>Tagline</label>
          <input value={info.tagline} onChange={set('tagline')} placeholder="India's trusted construction chemicals supplier" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={info.email} onChange={set('email')} placeholder="contact@constore.com" />
        </div>
        <div>
          <label>Phone</label>
          <input value={info.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label>GST Number</label>
          <input value={info.gst} onChange={set('gst')} placeholder="27XXXXX1234X1ZX" />
        </div>
        <div>
          <label>Website</label>
          <input value={info.website || ''} onChange={set('website')} placeholder="https://constore.com" />
        </div>
        <div className={styles.formFieldFull}>
          <label>Address</label>
          <textarea
            rows={2}
            value={info.address}
            onChange={set('address')}
            placeholder="123, Industrial Area, Chennai - 600001"
          />
        </div>
        <div className={styles.formFieldFull}>
          <button
            className="btn btn-primary"
            style={{ width: 'fit-content' }}
            onClick={() => save()}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Store Info'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   USER MANAGEMENT TAB
───────────────────────────────────── */
const ROLE_LABELS = {
  user:       'Customer',
  staff:      'Staff',
  admin:      'Admin',
  superadmin: 'Super Admin',
};

const ROLE_COLORS = {
  user:       '#6b7280',
  staff:      '#0891b2',
  admin:      '#1a3a5c',
  superadmin: '#7c3aed',
};

function UserMgmtTab() {
  const qc = useQueryClient();
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn:  () => api.get(`/users?search=${search}&role=${roleFilter}&limit=30`).then(r => r.data),
    keepPreviousData: true,
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }) => api.put(`/users/${id}/role`, { role }),
    onSuccess:  () => { toast.success('Role updated'); qc.invalidateQueries(['admin-users']); },
    onError:    () => toast.error('Update failed'),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/users/${id}/status`, { isActive }),
    onSuccess:  () => { toast.success('Status updated'); qc.invalidateQueries(['admin-users']); },
    onError:    () => toast.error('Update failed'),
  });

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>User Management</h2>
      <p className={styles.cardSub}>Assign roles and manage access. Only Super Admins can change roles.</p>

      <div className={styles.userFilters}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.pickerInput}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className={styles.statusSelect}
          style={{ minWidth: 140 }}
        >
          <option value="">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {isLoading ? <div className="spinner" /> : (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {data?.total || 0} users found
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: ROLE_COLORS[u.role], color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                        }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                          <span className={styles.muted}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.muted}>{u.phone || '—'}</td>
                    <td className={styles.muted}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={u.role}
                        onChange={e => {
                          if (window.confirm(`Change ${u.name}'s role to "${ROLE_LABELS[e.target.value]}"?`)) {
                            updateRole({ id: u._id, role: e.target.value });
                          }
                        }}
                        style={{ color: ROLE_COLORS[u.role], fontWeight: 600 }}
                      >
                        {Object.entries(ROLE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{
                          padding: '0.3rem 0.9rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: 'none',
                          background: u.isActive ? '#e5f5ec' : '#fdeee8',
                          color: u.isActive ? 'var(--success)' : 'var(--error)',
                        }}
                        onClick={() => toggleStatus({ id: u._id, isActive: !u.isActive })}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}