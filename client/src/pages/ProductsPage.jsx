import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import styles from './ProductsPage.module.css';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('keyword') || '');

  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const page     = Number(searchParams.get('page')) || 1;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, sort, page, keyword: searchParams.get('keyword') }],
    queryFn: () => api.get('/products', { params: { category, sort, page, limit: 12, keyword: searchParams.get('keyword') || '' } }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('keyword', search);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className={styles.topBar}>
        <h1 className="section-title">Products</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className={styles.layout}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <ul className={styles.filterList}>
              <li>
                <button
                  className={`${styles.filterItem} ${!category ? styles.active : ''}`}
                  onClick={() => updateParam('category', '')}
                >All Categories</button>
              </li>
              {categories?.map(cat => (
                <li key={cat._id}>
                  <button
                    className={`${styles.filterItem} ${category === cat.slug ? styles.active : ''}`}
                    onClick={() => updateParam('category', cat.slug)}
                  >
                    {cat.name}
                    <span className={styles.filterCount}>{cat.productCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Sort By</h3>
            <ul className={styles.filterList}>
              {SORT_OPTIONS.map(opt => (
                <li key={opt.value}>
                  <button
                    className={`${styles.filterItem} ${sort === opt.value ? styles.active : ''}`}
                    onClick={() => updateParam('sort', opt.value)}
                  >{opt.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* GRID */}
        <div className={styles.main}>
          {isLoading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <p>No products found. Try a different search or category.</p>
            </div>
          ) : (
            <>
              <p className={styles.resultCount}>{data?.total} products found</p>
              <div className={styles.grid}>
                {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* PAGINATION */}
              {data?.pages > 1 && (
                <div className={styles.pagination}>
                  {[...Array(data.pages)].map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.pageBtn} ${page === i + 1 ? styles.pageActive : ''}`}
                      onClick={() => updateParam('page', String(i + 1))}
                    >{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
