import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import { Clock, Search, UtensilsCrossed, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '@/components/recipes/Recipes.module.css';

const FILTER_TAGS = ['All', 'Quick (< 30 min)', 'Medium', 'Long (> 60 min)'];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    apiClient.get('/api/recipes')
      .then(res => setRecipes(res.data))
      .catch(() => setError('Failed to load recipes.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = recipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
    }
    if (activeFilter === 'Quick (< 30 min)') list = list.filter(r => (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0) < 30);
    else if (activeFilter === 'Medium') list = list.filter(r => { const t = (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0); return t >= 30 && t <= 60; });
    else if (activeFilter === 'Long (> 60 min)') list = list.filter(r => (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0) > 60);
    return list;
  }, [recipes, search, activeFilter]);

  if (loading) return <div className={styles.loading}>Loading recipes…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Recipes</h1>
          <p className={styles.subtitle}>{recipes.length} recipes in your library</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
      </div>

      {/* Filter tags */}
      <div className={styles.filters}>
        {FILTER_TAGS.map(tag => (
          <button
            key={tag}
            className={`${styles.tag} ${activeFilter === tag ? styles.tagActive : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>No recipes found.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/recipes/${r.id}`} className={styles.card}>
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgPlaceholder}><UtensilsCrossed size={28} /></div>
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    {(r.prep_time_minutes || r.cook_time_minutes) && (
                      <span className={styles.metaItem}><Clock size={13} /> {(r.prep_time_minutes || 0) + (r.cook_time_minutes || 0)} min</span>
                    )}
                    {r.servings && <span className={styles.metaItem}><Users size={13} /> {r.servings}</span>}
                  </div>
                  <h3 className={styles.cardTitle}>{r.title}</h3>
                  {r.description && <p className={styles.cardDesc}>{r.description}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}