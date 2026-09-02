import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import { FiPlus, FiSearch, FiClock, FiUsers, FiX } from 'react-icons/fi';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', prep_time: '', cook_time: '', servings: '', instructions: '', ingredients: '' });

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/recipes');
      setRecipes(res.data);
    } catch { setError('Failed to load recipes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.instructions.trim()) return;
    setSaving(true);
    try {
      const ingredients = form.ingredients.split('\n').filter(Boolean).map(line => {
        const parts = line.split(',').map(s => s.trim());
        return { name: parts[0] || '', quantity: parts[1] || '', unit: parts[2] || '' };
      });
      await apiClient.post('/api/recipes', {
        title: form.title, description: form.description,
        prep_time: form.prep_time ? Number(form.prep_time) : null,
        cook_time: form.cook_time ? Number(form.cook_time) : null,
        servings: form.servings ? Number(form.servings) : null,
        instructions: form.instructions, ingredients,
      });
      setShowModal(false);
      setForm({ title: '', description: '', prep_time: '', cook_time: '', servings: '', instructions: '', ingredients: '' });
      fetchRecipes();
    } catch { setError('Failed to create recipe'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-800">Recipes</h1>
          <p className="text-stone-500 text-sm mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your library</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 flex items-center gap-2 self-start">
          <FiPlus className="w-4 h-4" /> Add Recipe
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes…"
          className="w-full border border-stone-200 rounded-lg pl-10 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 text-sm">{search ? 'No recipes match your search.' : 'No recipes yet. Add your first one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(recipe => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow overflow-hidden group">
              {recipe.image_url ? (
                <div className="h-40 overflow-hidden">
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-emerald-100 to-stone-100 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-stone-800 leading-tight">{recipe.title}</h3>
                {recipe.description && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                  {(recipe.prep_time || recipe.cook_time) && (
                    <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                  )}
                  {recipe.servings && <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{recipe.servings}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-stone-800">Add a Recipe</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1 text-stone-700">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-stone-700">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Prep (min)</label>
                  <input type="number" value={form.prep_time} onChange={e => setForm(f => ({ ...f, prep_time: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Cook (min)</label>
                  <input type="number" value={form.cook_time} onChange={e => setForm(f => ({ ...f, cook_time: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-stone-700">Servings</label>
                  <input type="number" value={form.servings} onChange={e => setForm(f => ({ ...f, servings: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1 text-stone-700">Instructions *</label>
                <textarea rows={3} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-stone-700">Ingredients</label>
                <p className="text-xs text-stone-400 mb-1">One per line: name, quantity, unit</p>
                <textarea rows={3} value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  placeholder="Chicken breast, 2, lbs&#10;Olive oil, 2, tbsp" className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-stone-200 text-sm hover:bg-stone-100">Cancel</button>
              <button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.instructions.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Recipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}