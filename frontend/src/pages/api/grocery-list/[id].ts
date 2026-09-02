import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'PATCH') {
    try {
      const { checked, name, quantity, unit } = req.body;

      if (isSupabase()) {
        const updates: any = {};
        if (checked !== undefined) updates.checked = checked;
        if (name !== undefined) updates.name = name;
        if (quantity !== undefined) updates.quantity = quantity;
        if (unit !== undefined) updates.unit = unit;
        const { data, error } = await db.from('grocery_items').update(updates).eq('id', id).select('id, name, quantity, unit, checked').single();
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }

      const existing = db.prepare('SELECT * FROM grocery_items WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Not found' });

      db.prepare('UPDATE grocery_items SET checked = ?, name = ?, quantity = ?, unit = ? WHERE id = ?').run(
        checked !== undefined ? (checked ? 1 : 0) : existing.checked,
        name ?? existing.name,
        quantity ?? existing.quantity,
        unit ?? existing.unit,
        id
      );
      const updated = db.prepare('SELECT id, name, quantity, unit, checked FROM grocery_items WHERE id = ?').get(id);
      return res.json({ ...updated, checked: !!updated.checked });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase()) {
        await db.from('grocery_items').delete().eq('id', id);
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM grocery_items WHERE id = ?').run(id);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}