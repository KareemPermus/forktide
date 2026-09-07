import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const { checked } = req.body;

    if (isSupabase()) {
      const { data, error } = await db.from('grocery_items').update({ checked: !!checked }).eq('id', id).select().single();
      if (error) return res.status(404).json({ error: 'Not found' });
      return res.json(data);
    }

    db.prepare('UPDATE grocery_items SET checked = ? WHERE id = ?').run(checked ? 1 : 0, id);
    const item = db.prepare('SELECT * FROM grocery_items WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.json({ ...item, id: Number(item.id), checked: !!item.checked, recipe_id: item.recipe_id ? Number(item.recipe_id) : null });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}