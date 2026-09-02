import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { GroceryItem } from '@/types';
import { FiPlus, FiTrash2, FiCheck, FiShoppingCart, FiX } from 'react-icons/fi';

export default function GroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/grocery-list');
      setItems(res.data);
    } catch { setError('Failed to load grocery list'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await apiClient.post('/api/grocery-list', { name: name.trim(), quantity, unit });
      setItems(prev => [...prev, res.data]);
      setName(''); setQuantity(''); setUnit('');
    } catch { setError('Failed to add item'); }
  };

  const toggleCheck = async (item: GroceryItem) => {
    try {
      const res = await apiClient.patch(`/api/grocery-list/${item.id}`, { checked: !item.checked });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...res.data } : i));
    } catch { setError('Failed to update item'); }
  };

  const deleteItem = async (id: number) => {
    try {
      await apiClient.delete(`/api/grocery-list/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { setError('Failed to delete item'); }
  };

  const clearChecked = async () => {
    try {
      await apiClient.delete('/api/grocery-list/clear-checked');
      setItems(prev => prev.filter(i => !i.checked));
    } catch { setError('Failed to clear items'); }
  };

  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-800">Grocery List</h1>
          <p className="text-stone-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
        </div>
        {checked.length > 0 && (
          <button onClick={clearChecked} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm hover:bg-stone-100 flex items-center gap-2 text-stone-600">
            <FiTrash2 className="w-4 h-4" /> Clear checked
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><FiX className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={addItem} className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name…"
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty"
            className="w-20 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit"
            className="w-20 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 flex items-center gap-1">
            <FiPlus className="w-4 h-4" /> Add
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-stone-400 text-xs font-medium">To Buy</p>
          <p className="text-2xl font-extrabold mt-1">{unchecked.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-stone-400 text-xs font-medium">Completed</p>
          <p className="text-2xl font-extrabold mt-1">{checked.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 col-span-2 md:col-span-1">
          <p className="text-stone-400 text-xs font-medium">Progress</p>
          <p className="text-2xl font-extrabold mt-1">{items.length ? Math.round((checked.length / items.length) * 100) : 0}%</p>
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">Your grocery list is empty</p>
          <p className="text-stone-400 text-sm mt-1">Add items above or import from a recipe</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unchecked.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400 font-bold mb-2">To Buy</p>
              <div className="space-y-2">
                {unchecked.map(item => (
                  <GroceryRow key={item.id} item={item} onToggle={toggleCheck} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          )}
          {checked.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400 font-bold mb-2">Completed</p>
              <div className="space-y-2">
                {checked.map(item => (
                  <GroceryRow key={item.id} item={item} onToggle={toggleCheck} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroceryRow({ item, onToggle, onDelete }: { item: GroceryItem; onToggle: (i: GroceryItem) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3 group ${item.checked ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(item)}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 hover:border-emerald-400'}`}>
        {item.checked && <FiCheck className="w-4 h-4" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-tight ${item.checked ? 'line-through text-stone-400' : 'text-stone-800'}`}>{item.name}</p>
        {(item.quantity || item.unit) && (
          <p className="text-xs text-stone-400 mt-0.5">{[item.quantity, item.unit].filter(Boolean).join(' ')}</p>
        )}
      </div>
      <button onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-1">
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
}