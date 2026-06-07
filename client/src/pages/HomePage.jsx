import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import styles from './HomePage.module.css';

const CATEGORIES = [
  { name: 'Waterproofing',      icon: '🌊', slug: 'waterproofing', colorClass: 'blue'   },
  { name: 'Adhesives & Grouts', icon: '🔩', slug: 'adhesives',     colorClass: 'amber'  },
  { name: 'Concrete Admixtures',icon: '🧱', slug: 'admixtures',    colorClass: 'green'  },
  { name: 'Protective Coatings',icon: '🛡️', slug: 'coatings',      colorClass: 'coral'  },
  { name: 'Repair Mortars',     icon: '🔧', slug: 'repair',        colorClass: 'purple' },
  { name: 'Sealants',           icon: '🌿', slug: 'sealants',      colorClass: 'teal'   },
];

export default function HomePage() {
  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?featured=true&limit=4').then(r => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const { data: heroSetting } = useQuery({
    queryKey: ['setting-hero-product'],
    queryFn: () => api.get('/settings/hero_product').then(r => r.data),
  });

  const { data: heroProduct } = useQuery({
    queryKey: ['hero-product', heroSetting?.value],
    queryFn: async () => {
      if (!heroSetting?.value) return null;
      const { data } = await api.get(`/products?limit=50`);
      return data.products?.find(p => p._id === heroSetting.value) || null;
    },
    enabled: !!heroSetting,
  });

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>🏗️ Trusted by 5,000+ contractors</div>
            <h1 className={styles.heroTitle}>Premium Construction<br /><span>Chemicals</span> Delivered</h1>
            <p className={styles.heroSub}>High-performance waterproofing, adhesives, sealants, and concrete admixtures. Professional-grade solutions for every construction challenge.</p>
            <div className={styles.heroActions}>
              <Link to="/products" className="btn btn-accent" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>Shop Now</Link>
              <a href="#" className={styles.btnHeroOutline}>Download Catalogue</a>
            </div>
            <div className={styles.heroStats}>
              <div><span className={styles.statNum}>500+</span><span className={styles.statLabel}>Products</span></div>
              <div><span className={styles.statNum}>20yr</span><span className={styles.statLabel}>Experience</span></div>
              <div><span className={styles.statNum}>99%</span><span className={styles.statLabel}>Satisfaction</span></div>
            </div>
          </div>

          {/* DYNAMIC HERO CARD */}
          <div className={styles.heroCard}>
            <div className={styles.heroCardImg}>
              {heroProduct?.images?.[0]
                ? <img src={heroProduct.images[0].url} alt={heroProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                : <span>🧪</span>
              }
            </div>
            <div className={styles.heroCardName}>
              {heroProduct?.name || 'HydroSeal Pro X1'}
            </div>
            <div className={styles.heroCardCat}>
              {heroProduct?.category?.name || 'Waterproofing Membrane'}
            </div>
            <div className={styles.heroCardPrice}>
              ₹{heroProduct ? heroProduct.price.toLocaleString() : '1,850'} / {heroProduct?.unit || 'unit'}
            </div>
            {heroProduct && (
              <Link
                to={`/products/${heroProduct.slug}`}
                style={{ display: 'inline-block', marginTop: '0.75rem', background: 'var(--accent)', color: 'var(--primary)', padding: '0.45rem 1.1rem', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700 }}
              >
                View Product →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className={styles.trustBar}>
        {[
          { icon: '✅', label: 'ISO 9001 Certified'     },
          { icon: '🏛️', label: 'BIS Approved Products'  },
          { icon: '🚚', label: 'Free Delivery ₹10,000+' },
          { icon: '📍', label: 'Pan-India Delivery'     },
          { icon: '📞', label: '24/7 Technical Support' },
        ].map(({ icon, label }) => (
          <div key={label} className={styles.trustItem}><span>{icon}</span>{label}</div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Find the right chemical solution for your project</p>
            </div>
            <Link to="/products" className={styles.linkAll}>View all →</Link>
          </div>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const apiCat = catData?.find(c => c.slug === cat.slug);
              return (
                <Link key={cat.slug} to={`/products?category=${cat.slug}`} className={styles.catCard}>
                  <div className={`${styles.catIcon} ${styles[cat.colorClass]}`}>{cat.icon}</div>
                  <div className={styles.catName}>{cat.name}</div>
                  <div className={styles.catCount}>{apiCat ? `${apiCat.productCount} products` : '—'}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={styles.sectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Top-rated construction chemicals</p>
            </div>
            <Link to="/products" className={styles.linkAll}>See all →</Link>
          </div>
          <div className={styles.productsGrid}>
            {featuredData?.products?.map(p => <ProductCard key={p._id} product={p} />) ?? (
              [1,2,3,4].map(i => <div key={i} className={styles.productSkeleton} />)
            )}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <div className="container">
        <div className={styles.promoBanner}>
          <div>
            <div className={styles.promoLabel}>Limited Time Offer</div>
            <div className={styles.promoTitle}>Bulk Order Discount — Up to 20% Off</div>
            <div className={styles.promoDesc}>Orders above ₹50,000 qualify for special contractor pricing. Use code at checkout.</div>
          </div>
          <div className={styles.promoCodeBox}>
            <div className={styles.promoCodeLabel}>Coupon Code</div>
            <div className={styles.promoCode}>BUILD20</div>
            <div className={styles.promoOff}>20% off on bulk orders</div>
          </div>
        </div>
      </div>

      {/* WHY US */}
      <section className={styles.section}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Why Choose Constore?</h2>
          <div className={styles.featuresGrid}>
            {[
              { icon: '✅', title: 'Certified Quality', desc: 'All products tested and certified to BIS and international standards.' },
              { icon: '⏱️', title: 'Fast Dispatch',     desc: 'Same-day dispatch for orders placed before 2 PM. Track in real-time.' },
              { icon: '👥', title: 'Expert Support',    desc: 'Our technical team guides specification, application and troubleshooting.' },
              { icon: '💳', title: 'Flexible Credit',   desc: '30-day credit terms available for verified contractor accounts.' },
            ].map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}