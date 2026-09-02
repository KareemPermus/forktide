import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data, error } = await db.from('recipes').select('id, title, description, image_url, prep_time, cook_time, servings, created_at').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      const rows = db.prepare('SELECT id, title, description, image_url, prep_time, cook_time, servings, created_at FROM recipes ORDER BY created_at DESC').all();
      return res.json(rows);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, image_url, prep_time, cook_time, servings, instructions, ingredients } = req.body;
      if (!title || !instructions) return res.status(400).json({ error: 'title and instructions required' });

      if (isSupabase()) {
        const { data: recipe, error } = await db.from('recipes').insert({ title, description: description || null, image_url: image_url || null, prep_time: prep_time || null, cook_time: cook_time || null, servings: servings || null, instructions }).select().single();
        if (error) return res.status(500).json({ error: error.message });

        let ings: any[] = [];
        if (ingredients?.length) {
          const rows = ingredients.map((i: any) => ({ recipe_id: recipe.id, name: i.name, quantity: i.quantity || null, unit: i.unit || null }));
          const { data, error: ie } = await db.from('recipe_ingredients').insert(rows).select();
          if (ie) return res.status(500).json({ error: ie.message });
          ings = data || [];
        }
        return res.status(201).json({ ...recipe, ingredients: ings });
      }

      const result = db.prepare('INSERT INTO recipes (title, description, image_url, prep_time, cook_time, servings, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || null, image_url || null, prep_time || null, cook_time || null, servings || null, instructions);
      const recipeId = result.lastInsertRowid;
      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);

      let ings: any[] = [];
      if (ingredients?.length) {
        const stmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)');
        for (const i of ingredients) {
          const r = stmt.run(recipeId, i.name, i.quantity || null, i.unit || null);
          ings.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '' });
        }
      }
      return res.status(201).json({ ...recipe, ingredients: ings });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}