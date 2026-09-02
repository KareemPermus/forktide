import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data, error } = await db.from('grocery_items').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      const rows = db.prepare('SELECT * FROM grocery_items ORDER BY created_at DESC').all();
      return res.json(rows.map((r: any) => ({ ...r, checked: !!r.checked })));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, quantity, unit, recipe_id } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });

      if (isSupabase()) {
        const { data, error } = await db.from('grocery_items').insert({ name, quantity: quantity || null, unit: unit || null, checked: false, recipe_id: recipe_id || null }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }

      const result = db.prepare('INSERT INTO grocery_items (name, quantity, unit, checked, recipe_id) VALUES (?, ?, ?, 0, ?)').run(name, quantity || null, unit || null, recipe_id || null);
      const item = db.prepare('SELECT * FROM grocery_items WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json({ ...item, checked: !!item.checked });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}