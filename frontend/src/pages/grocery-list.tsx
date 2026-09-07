import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import type { GroceryItem } from '@/types';
import { ShoppingCart, Plus, Trash2, Check, Square, CheckSquare, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/grocery-list/GroceryList.module.css';

export default function GroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/grocery-list');
      setItems(res.data);
      setError('');
    } catch {
      setError('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await apiClient.post('/api/grocery-list', {
        name: newName.trim(),
        quantity: newQty || null,
        unit: newUnit || null,
        checked: false,
      });
      setItems(prev => [...prev, res.data]);
      setNewName(''); setNewQty(''); setNewUnit('');
    } catch { setError('Failed to add item'); }
    finally { setAdding(false); }
  };

  const toggleItem = async (item: GroceryItem) => {
    try {
      const res = await apiClient.patch(`/api/grocery-list/${item.id}`, { checked: !item.checked });
      setItems(prev => prev.map(i => i.id === item.id ? res.data : i));
    } catch { setError('Failed to update item'); }
  };

  const clearAll = async () => {
    if (!confirm('Clear all grocery items?')) return;
    setClearing(true);
    try {
      await apiClient.delete('/api/grocery-list');
      setItems([]);
    } catch { setError('Failed to clear list'); }
    finally { setClearing(false); }
  };

  const checkedCount = items.filter(i => i.checked).length;
  const uncheckedCount = items.length - checkedCount;

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading grocery list…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Grocery List</h1>
          <p className={styles.subtitle}>{items.length} items · {checkedCount} checked</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearAll} disabled={clearing} className={styles.clearBtn}>
            <Trash2 size={16} /> Clear all
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><ShoppingCart size={18} /></div>
          <div>
            <div className={styles.statValue}>{items.length}</div>
            <div className={styles.statLabel}>Total items</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconPending}><Square size={18} /></div>
          <div>
            <div className={styles.statValue}>{uncheckedCount}</div>
            <div className={styles.statLabel}>To buy</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconDone}><Check size={18} /></div>
          <div>
            <div className={styles.statValue}>{checkedCount}</div>
            <div className={styles.statLabel}>Done</div>
          </div>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={addItem} className={styles.addForm}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Item name…"
          className={styles.inputName}
          required
        />
        <input
          value={newQty}
          onChange={e => setNewQty(e.target.value)}
          placeholder="Qty"
          className={styles.inputQty}
        />
        <input
          value={newUnit}
          onChange={e => setNewUnit(e.target.value)}
          placeholder="Unit"
          className={styles.inputUnit}
        />
        <button type="submit" disabled={adding || !newName.trim()} className={styles.addBtn}>
          <Plus size={16} /> Add
        </button>
      </form>

      {/* List */}
      {items.length === 0 ? (
        <div className={styles.empty}>
          <Package size={48} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Your grocery list is empty</p>
          <p className={styles.emptyDesc}>Add items above or generate from recipes.</p>
        </div>
      ) : (
        <div className={styles.listCard}>
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${styles.listItem} ${item.checked ? styles.listItemChecked : ''}`}
                onClick={() => toggleItem(item)}
              >
                <span className={styles.checkbox}>
                  {item.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                </span>
                <span className={`${styles.itemName} ${item.checked ? styles.itemNameChecked : ''}`}>
                  {item.name}
                </span>
                {(item.quantity || item.unit) && (
                  <span className={styles.itemMeta}>
                    {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}