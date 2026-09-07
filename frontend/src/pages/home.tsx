import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import { Clock, Utensils, ShoppingBasket, Flame, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '@/components/HomePage.module.css';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/api/recipes')
      .then(res => setRecipes(res.data))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Utensils, label: 'Total Recipes', value: recipes.length, sub: 'in your library', color: '#10b981' },
    { icon: ShoppingBasket, label: 'Grocery Items', value: '—', sub: 'Check grocery list', color: '#f59e0b' },
    { icon: Flame, label: 'Avg. Prep Time', value: recipes.length ? Math.round(recipes.reduce((a, r) => a + (r.prep_time_minutes || 0), 0) / recipes.length) + 'm' : '—', sub: 'across recipes', color: '#f43f5e' },
    { icon: Clock, label: 'Avg. Cook Time', value: recipes.length ? Math.round(recipes.reduce((a, r) => a + (r.cook_time_minutes || 0), 0) / recipes.length) + 'm' : '—', sub: 'across recipes', color: '#3b82f6' },
  ];

  const featured = recipes.slice(0, 4);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Good morning, Chef 👋</h1>
          <p className={styles.subtitle}>Here&apos;s what&apos;s cooking today.</p>
        </div>
        <Link href="/recipes" className={styles.ctaBtn}>
          Browse Recipes <ChevronRight size={16} />
        </Link>
      </div>

      <section className={styles.statsGrid}>
        {stats.map((s, i) => (
          <motion.div key={i} className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={styles.statIcon} style={{ background: s.color + '18', color: s.color }}>
              <s.icon size={18} />
            </div>
            <div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </section>

      {loading && <p className={styles.loadingText}>Loading recipes…</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Suggested for you</h2>
            <Link href="/recipes" className={styles.viewAll}>Browse all <ChevronRight size={14} /></Link>
          </div>

          {featured.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No recipes yet. <Link href="/recipes" className={styles.link}>Add your first recipe!</Link></p>
            </div>
          ) : (
            <div className={styles.recipeGrid}>
              {featured.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/recipes/${r.id}`} className={styles.recipeCard}>
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title} className={styles.recipeImg} />
                    ) : (
                      <div className={styles.recipeImgPlaceholder}><Utensils size={24} /></div>
                    )}
                    <div className={styles.recipeBody}>
                      <div className={styles.recipeMeta}>
                        <Clock size={12} /> {(r.prep_time_minutes || 0) + (r.cook_time_minutes || 0)} min · {r.servings || '?'} servings
                      </div>
                      <div className={styles.recipeTitle}>{r.title}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/recipes" className={styles.actionCard}>
            <Utensils size={20} /> <span>View Recipes</span>
          </Link>
          <Link href="/grocery-list" className={styles.actionCard}>
            <ShoppingBasket size={20} /> <span>Grocery List</span>
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>Forktide · Plan smarter, eat better.</footer>
    </div>
  );
}