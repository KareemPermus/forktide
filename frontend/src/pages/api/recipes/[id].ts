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
        const { data: ingredients } = await db.from('recipe_ingredients').select('*').eq('recipe_id', id);
        const { data: steps } = await db.from('recipe_steps').select('*').eq('recipe_id', id).order('step_number');
        return res.json({ ...recipe, ingredients: ingredients || [], steps: steps || [] });
      }
      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      if (!recipe) return res.status(404).json({ error: 'Not found' });
      const ingredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ?').all(id);
      const steps = db.prepare('SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number').all(id);
      return res.json({ ...recipe, id: Number(recipe.id), ingredients: ingredients.map((i: any) => ({ ...i, id: Number(i.id) })), steps: steps.map((s: any) => ({ ...s, id: Number(s.id) })) });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase()) {
        await db.from('recipe_ingredients').delete().eq('recipe_id', id);
        await db.from('recipe_steps').delete().eq('recipe_id', id);
        await db.from('grocery_items').update({ recipe_id: null }).eq('recipe_id', id);
        await db.from('recipes').delete().eq('id', id);
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}