import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getDb();
  const { recipe_ids } = req.body;
  if (!Array.isArray(recipe_ids) || recipe_ids.length === 0) {
    return res.status(400).json({ error: 'recipe_ids array is required' });
  }

  try {
    if (isSupabase()) {
      const { data: ingredients, error } = await db.from('recipe_ingredients').select('*').in('recipe_id', recipe_ids);
      if (error) return res.status(500).json({ error: error.message });

      const items = (ingredients || []).map((i: any) => ({
        name: i.name, quantity: i.quantity || null, unit: i.unit || null, checked: false, recipe_id: i.recipe_id
      }));

      if (items.length === 0) return res.json([]);

      const { data: inserted, error: ie } = await db.from('grocery_items').insert(items).select();
      if (ie) return res.status(500).json({ error: ie.message });
      return res.status(201).json(inserted || []);
    }

    const placeholders = recipe_ids.map(() => '?').join(',');
    const ingredients = db.prepare(`SELECT * FROM recipe_ingredients WHERE recipe_id IN (${placeholders})`).all(...recipe_ids);

    const insertStmt = db.prepare('INSERT INTO grocery_items (name, quantity, unit, checked, recipe_id) VALUES (?,?,?,0,?)');
    const results: any[] = [];
    for (const i of ingredients) {
      const r = insertStmt.run(i.name, i.quantity || null, i.unit || null, i.recipe_id);
      results.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '', checked: false, recipe_id: Number(i.recipe_id) });
    }
    return res.status(201).json(results);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}