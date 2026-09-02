import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe, GroceryItem } from '@/types';
import { FiBookOpen, FiShoppingCart, FiClock, FiUsers } from 'react-icons/fi';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/recipes').then(r => r.data).catch(() => []),
      apiClient.get('/api/grocery-list').then(r => r.data).catch(() => []),
    ])
      .then(([r, g]) => {
        setRecipes(Array.isArray(r) ? r : []);
        setGroceryItems(Array.isArray(g) ? g : []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  const uncheckedGrocery = groceryItems.filter(i => !i.checked).length;
  const checkedGrocery = groceryItems.filter(i => i.checked).length;
  const totalPrepTime = recipes.reduce((s, r) => s + (r.prep_time || 0), 0);
  const totalServings = recipes.reduce((s, r) => s + (r.servings || 0), 0);

  const stats = [
    { label: 'Total Recipes', value: recipes.length, icon: <FiBookOpen className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Grocery Items', value: `${uncheckedGrocery}`, sub: checkedGrocery > 0 ? `${checkedGrocery} checked` : undefined, icon: <FiShoppingCart className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Prep Time', value: `${totalPrepTime}m`, icon: <FiClock className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total Servings', value: totalServings, icon: <FiUsers className="w-5 h-5" />, color: 'text-rose-600 bg-rose-50' },
  ];

  const recentRecipes = recipes.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-800">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Welcome to Forktide — your meal planner</p>
        </div>
        <Link href="/recipes" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 inline-flex items-center gap-2">
          <FiBookOpen className="w-4 h-4" /> Browse Recipes
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-stone-400 text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-extrabold mt-1">
                {s.value}
                {s.sub && <span className="text-sm font-medium text-stone-400 ml-1">/ {s.sub}</span>}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Recipes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-800">Recent Recipes</h2>
          <Link href="/recipes" className="text-emerald-600 text-sm font-medium hover:underline">View all →</Link>
        </div>
        {recentRecipes.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <p className="text-stone-400 mb-3">No recipes yet</p>
            <Link href="/recipes" className="text-emerald-600 font-medium hover:underline">Add your first recipe</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecipes.map(recipe => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow block">
                {recipe.image_url && (
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <h3 className="font-semibold text-stone-800 leading-tight">{recipe.title}</h3>
                {recipe.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{recipe.description}</p>}
                <div className="flex gap-3 mt-2 text-xs text-stone-500">
                  {recipe.prep_time != null && <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {recipe.prep_time}m prep</span>}
                  {recipe.cook_time != null && <span>{recipe.cook_time}m cook</span>}
                  {recipe.servings != null && <span>{recipe.servings} servings</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/grocery-list" className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <FiShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-stone-800">Grocery List</p>
            <p className="text-xs text-stone-400">{uncheckedGrocery} items to buy</p>
          </div>
        </Link>
        <Link href="/recipes" className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-stone-800">Recipe Library</p>
            <p className="text-xs text-stone-400">{recipes.length} recipes saved</p>
          </div>
        </Link>
      </div>
    </div>
  );
}