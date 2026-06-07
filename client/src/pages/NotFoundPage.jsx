import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏗️</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>This page is still under construction.</p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Back to Home</Link>
    </div>
  );
}
