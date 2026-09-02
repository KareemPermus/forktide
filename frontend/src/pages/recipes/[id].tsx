import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import Link from 'next/link';
import { FiClock, FiUsers, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';

interface RecipeDetail extends Recipe {
  ingredients?: { id: number; name: string; quantity: string; unit: string }[];
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const [grocerySuccess, setGrocerySuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/api/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(() => setError('Failed to load recipe.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToGrocery = async () => {
    if (!id) return;
    setAddingToGrocery(true);
    try {
      await apiClient.post(`/api/grocery-list/from-recipe/${id}`);
      setGrocerySuccess(true);
      setTimeout(() => setGrocerySuccess(false), 3000);
    } catch {
      setError('Failed to add ingredients to grocery list.');
    } finally {
      setAddingToGrocery(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !recipe) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/recipes" className="text-emerald-600 hover:underline text-sm font-medium">← Back to Recipes</Link>
      </div>
    );
  }

  if (!recipe) return null;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/recipes" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-600 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to Recipes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
        {recipe.image_url && (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-56 object-cover" />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-800">{recipe.title}</h1>
          {recipe.description && <p className="text-stone-500 text-sm mt-2">{recipe.description}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-stone-500">
            {recipe.prep_time != null && (
              <span className="flex items-center gap-1"><FiClock className="w-4 h-4" /> Prep: {recipe.prep_time}m</span>
            )}
            {recipe.cook_time != null && (
              <span className="flex items-center gap-1"><FiClock className="w-4 h-4" /> Cook: {recipe.cook_time}m</span>
            )}
            {totalTime > 0 && (
              <span className="font-semibold text-stone-700">Total: {totalTime}m</span>
            )}
            {recipe.servings != null && (
              <span className="flex items-center gap-1"><FiUsers className="w-4 h-4" /> {recipe.servings} servings</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm uppercase tracking-wide text-stone-500">Ingredients</h2>
            <button
              onClick={handleAddToGrocery}
              disabled={addingToGrocery}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              {addingToGrocery ? 'Adding…' : 'Add to List'}
            </button>
          </div>
          {grocerySuccess && (
            <p className="text-xs text-emerald-600 font-medium mb-3">✓ Added to grocery list!</p>
          )}
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <ul className="space-y-2">
              {recipe.ingredients.map(ing => (
                <li key={ing.id} className="flex items-baseline gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    {ing.quantity && <span className="font-semibold">{ing.quantity}</span>}
                    {ing.unit && <span className="text-stone-400"> {ing.unit}</span>}
                    {' '}{ing.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-400">No ingredients listed.</p>
          )}
        </div>

        {/* Instructions */}
        <div className="md:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-bold text-sm uppercase tracking-wide text-stone-500 mb-4">Instructions</h2>
          <div className="prose prose-sm prose-stone max-w-none">
            {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
}