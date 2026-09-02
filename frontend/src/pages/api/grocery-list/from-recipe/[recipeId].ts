import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getDb();
  const recipeId = Number(req.query.recipeId);
  if (isNaN(recipeId)) return res.status(400).json({ error: 'Invalid recipeId' });

  try {
    if (isSupabase()) {
      const { data: ingredients, error } = await db.from('recipe_ingredients').select('name, quantity, unit').eq('recipe_id', recipeId);
      if (error) return res.status(500).json({ error: error.message });
      if (!ingredients?.length) return res.status(404).json({ error: 'No ingredients found' });

      const rows = ingredients.map((i: any) => ({ name: i.name, quantity: i.quantity, unit: i.unit, checked: false, recipe_id: recipeId }));
      const { data, error: ie } = await db.from('grocery_items').insert(rows).select('id, name, quantity, unit, checked');
      if (ie) return res.status(500).json({ error: ie.message });
      return res.status(201).json(data);
    }

    const ingredients = db.prepare('SELECT name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?').all(recipeId);
    if (!ingredients.length) return res.status(404).json({ error: 'No ingredients found' });

    const stmt = db.prepare('INSERT INTO grocery_items (name, quantity, unit, checked, recipe_id) VALUES (?, ?, ?, 0, ?)');
    const items: any[] = [];
    for (const i of ingredients) {
      const r = stmt.run(i.name, i.quantity, i.unit, recipeId);
      items.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '', checked: false });
    }
    return res.status(201).json(items);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}