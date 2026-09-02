import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data: recipe, error } = await db.from('recipes').select('*').eq('id', id).single();
        if (error || !recipe) return res.status(404).json({ error: 'Not found' });
        const { data: ingredients } = await db.from('recipe_ingredients').select('id, name, quantity, unit').eq('recipe_id', id);
        return res.json({ ...recipe, ingredients: ingredients || [] });
      }
      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      if (!recipe) return res.status(404).json({ error: 'Not found' });
      const ingredients = db.prepare('SELECT id, name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?').all(id);
      return res.json({ ...recipe, ingredients });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, description, instructions, ingredients, image_url, prep_time, cook_time, servings } = req.body;

      if (isSupabase()) {
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (instructions !== undefined) updates.instructions = instructions;
        if (image_url !== undefined) updates.image_url = image_url;
        if (prep_time !== undefined) updates.prep_time = prep_time;
        if (cook_time !== undefined) updates.cook_time = cook_time;
        if (servings !== undefined) updates.servings = servings;

        const { data: recipe, error } = await db.from('recipes').update(updates).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });

        let ings: any[] = [];
        if (ingredients) {
          await db.from('recipe_ingredients').delete().eq('recipe_id', id);
          if (ingredients.length) {
            const rows = ingredients.map((i: any) => ({ recipe_id: id, name: i.name, quantity: i.quantity || null, unit: i.unit || null }));
            const { data } = await db.from('recipe_ingredients').insert(rows).select();
            ings = data || [];
          }
        }
        return res.json({ id: recipe.id, title: recipe.title, description: recipe.description, instructions: recipe.instructions, ingredients: ings });
      }

      const existing = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Not found' });

      db.prepare('UPDATE recipes SET title = ?, description = ?, instructions = ?, image_url = ?, prep_time = ?, cook_time = ?, servings = ? WHERE id = ?').run(
        title ?? existing.title, description ?? existing.description, instructions ?? existing.instructions, image_url ?? existing.image_url, prep_time ?? existing.prep_time, cook_time ?? existing.cook_time, servings ?? existing.servings, id
      );

      let ings: any[] = [];
      if (ingredients) {
        db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(id);
        const stmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)');
        for (const i of ingredients) {
          const r = stmt.run(id, i.name, i.quantity || null, i.unit || null);
          ings.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '' });
        }
      }

      const updated = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      return res.json({ id: updated.id, title: updated.title, description: updated.description, instructions: updated.instructions, ingredients: ings });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase()) {
        await db.from('recipe_ingredients').delete().eq('recipe_id', id);
        await db.from('recipes').delete().eq('id', id);
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(id);
      db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}