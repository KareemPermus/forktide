import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import Link from 'next/link';
import { Recipe, RecipeIngredient, RecipeStep } from '@/types';
import { motion } from 'framer-motion';
import styles from '@/styles/RecipeDetail.module.css';

interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const [grocerySuccess, setGrocerySuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/api/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(() => setError('Failed to load recipe.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToGrocery = async () => {
    if (!recipe) return;
    setAddingToGrocery(true);
    setGrocerySuccess(false);
    try {
      await apiClient.post('/api/grocery-list/generate', { recipe_ids: [recipe.id] });
      setGrocerySuccess(true);
      setTimeout(() => setGrocerySuccess(false), 3000);
    } catch {
      // silent
    } finally {
      setAddingToGrocery(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !confirm('Delete this recipe?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/recipes/${recipe.id}`);
      router.push('/recipes');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading recipe…</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>{error || 'Recipe not found.'}</p>
        <Link href="/recipes" className={styles.backLink}>← Back to recipes</Link>
      </div>
    );
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link href="/recipes" className={styles.backLink}>← Back to recipes</Link>

        {/* Hero */}
        <div className={styles.hero}>
          {recipe.image_url && (
            <img src={recipe.image_url} alt={recipe.title} className={styles.heroImg} />
          )}
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{recipe.title}</h1>
            {recipe.description && <p className={styles.description}>{recipe.description}</p>}
            <div className={styles.metaRow}>
              {recipe.prep_time_minutes != null && (
                <span className={styles.metaChip}>🔪 Prep {recipe.prep_time_minutes}m</span>
              )}
              {recipe.cook_time_minutes != null && (
                <span className={styles.metaChip}>🔥 Cook {recipe.cook_time_minutes}m</span>
              )}
              {totalTime > 0 && (
                <span className={styles.metaChip}>⏱ Total {totalTime}m</span>
              )}
              {recipe.servings != null && (
                <span className={styles.metaChip}>🍽 {recipe.servings} servings</span>
              )}
            </div>
            <div className={styles.actions}>
              <button onClick={handleAddToGrocery} disabled={addingToGrocery} className={styles.primaryBtn}>
                {addingToGrocery ? 'Adding…' : grocerySuccess ? '✓ Added!' : '🛒 Add to Grocery List'}
              </button>
              <button onClick={handleDelete} disabled={deleting} className={styles.deleteBtn}>
                {deleting ? 'Deleting…' : '🗑 Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className={styles.grid}>
          {/* Ingredients */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ingredients</h2>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className={styles.ingredientList}>
                {recipe.ingredients.map(ing => (
                  <li key={ing.id} className={styles.ingredientItem}>
                    <span className={styles.dot} />
                    <span>
                      {ing.quantity && <strong>{ing.quantity}</strong>}
                      {ing.unit && ` ${ing.unit}`}
                      {' '}{ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>No ingredients listed.</p>
            )}
          </div>

          {/* Steps */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Instructions</h2>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className={styles.stepList}>
                {recipe.steps
                  .sort((a, b) => a.step_number - b.step_number)
                  .map(step => (
                    <li key={step.id} className={styles.stepItem}>
                      <span className={styles.stepNum}>{step.step_number}</span>
                      <p>{step.instruction}</p>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className={styles.empty}>No steps listed.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}