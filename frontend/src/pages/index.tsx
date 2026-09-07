import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Utensils, ShoppingBasket, Flame, ArrowRight } from 'lucide-react';
import apiClient from '@/api/client';
import type { Recipe } from '@/types';
import styles from '@/styles/home.module.css';

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

  const featured = recipes.slice(0, 4);
  const images = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
  ];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.section className={styles.hero} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className={styles.heroTitle}>Good morning, Chef</h1>
          <p className={styles.heroSubtitle}>Here's what's cooking — plan smarter, eat better.</p>
        </div>
        <Link href="/recipes" className={styles.ctaButton}>
          <Utensils size={16} /> Browse Recipes
        </Link>
      </motion.section>

      {/* Stats */}
      <section className={styles.statsGrid}>
        {[
          { icon: <Utensils size={16} />, label: 'Total Recipes', value: recipes.length, sub: 'in your library', color: 'var(--accent)' },
          { icon: <ShoppingBasket size={16} />, label: 'Grocery Items', value: '—', sub: 'check your list', color: '#10b981' },
          { icon: <Flame size={16} />, label: 'Avg. Prep Time', value: recipes.length ? `${Math.round(recipes.reduce((a, r) => a + (r.prep_time_minutes || 0), 0) / recipes.length)}m` : '—', sub: 'across recipes', color: '#f59e0b' },
          { icon: <Clock size={16} />, label: 'Avg. Cook Time', value: recipes.length ? `${Math.round(recipes.reduce((a, r) => a + (r.cook_time_minutes || 0), 0) / recipes.length)}m` : '—', sub: 'across recipes', color: '#6366f1' },
        ].map((s, i) => (
          <motion.div key={i} className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className={styles.statIcon} style={{ color: s.color }}>{s.icon}</div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </motion.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <Link href="/recipes" className={styles.actionCard}>
          <Utensils size={20} />
          <span>View All Recipes</span>
          <ArrowRight size={16} />
        </Link>
        <Link href="/grocery-list" className={styles.actionCard}>
          <ShoppingBasket size={20} />
          <span>Grocery List</span>
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Featured Recipes */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Suggested for you</h2>
          <Link href="/recipes" className={styles.seeAll}>Browse all <ArrowRight size={14} /></Link>
        </div>

        {loading && <p className={styles.muted}>Loading recipes…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && featured.length === 0 && <p className={styles.muted}>No recipes yet. Add some!</p>}

        <div className={styles.recipesGrid}>
          {featured.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <Link href={`/recipes/${r.id}`} className={styles.recipeCard}>
                <div className={styles.recipeImageWrap}>
                  <img src={r.image_url || images[i % images.length]} alt={r.title} className={styles.recipeImage} />
                </div>
                <div className={styles.recipeInfo}>
                  <div className={styles.recipeMeta}>
                    <Clock size={12} /> {r.prep_time_minutes || 0 + (r.cook_time_minutes || 0)} min · {r.servings || '?'} servings
                  </div>
                  <div className={styles.recipeTitle}>{r.title}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>Forktide Meal Planner · Plan smarter, eat better.</footer>
    </div>
  );
}