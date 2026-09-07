import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data, error } = await db.from('recipes').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      const rows = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC').all();
      return res.json(rows);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, image_url, prep_time_minutes, cook_time_minutes, servings, ingredients, steps } = req.body;
      if (!title) return res.status(400).json({ error: 'title is required' });

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

      if (isSupabase()) {
        const { data: recipe, error } = await db.from('recipes').insert({ title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings }).select().single();
        if (error) return res.status(500).json({ error: error.message });

        let insertedIngredients: any[] = [];
        let insertedSteps: any[] = [];

        if (ingredients?.length) {
          const { data: ings, error: ie } = await db.from('recipe_ingredients').insert(
            ingredients.map((i: any) => ({ recipe_id: recipe.id, name: i.name, quantity: i.quantity || null, unit: i.unit || null }))
          ).select();
          if (!ie) insertedIngredients = ings || [];
        }
        if (steps?.length) {
          const { data: sts, error: se } = await db.from('recipe_steps').insert(
            steps.map((s: any, idx: number) => ({ recipe_id: recipe.id, step_number: s.step_number || idx + 1, instruction: s.instruction }))
          ).select();
          if (!se) insertedSteps = sts || [];
        }

        return res.status(201).json({ ...recipe, ingredients: insertedIngredients, steps: insertedSteps });
      }

      // SQLite
      const result = db.prepare('INSERT INTO recipes (title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings) VALUES (?,?,?,?,?,?,?)').run(
        title, slug, description || null, image_url || null, prep_time_minutes || null, cook_time_minutes || null, servings || null
      );
      const recipeId = result.lastInsertRowid;

      const insertedIngredients: any[] = [];
      if (ingredients?.length) {
        const stmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?,?,?,?)');
        for (const i of ingredients) {
          const r = stmt.run(recipeId, i.name, i.quantity || null, i.unit || null);
          insertedIngredients.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '' });
        }
      }
      const insertedSteps: any[] = [];
      if (steps?.length) {
        const stmt = db.prepare('INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES (?,?,?)');
        steps.forEach((s: any, idx: number) => {
          const r = stmt.run(recipeId, s.step_number || idx + 1, s.instruction);
          insertedSteps.push({ id: Number(r.lastInsertRowid), step_number: s.step_number || idx + 1, instruction: s.instruction });
        });
      }

      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);
      return res.status(201).json({ ...recipe, id: Number(recipe.id), ingredients: insertedIngredients, steps: insertedSteps });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}