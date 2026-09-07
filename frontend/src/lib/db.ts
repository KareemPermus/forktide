import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      prep_time_minutes INTEGER,
      cook_time_minutes INTEGER,
      servings INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT
    );
    CREATE TABLE IF NOT EXISTS recipe_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      checked INTEGER DEFAULT 0,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get();
  if (count.c === 0) {
    const insertRecipe = db.prepare('INSERT INTO recipes (title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings) VALUES (?,?,?,?,?,?,?)');
    const insertIngredient = db.prepare('INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?,?,?,?)');
    const insertStep = db.prepare('INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES (?,?,?)');

    const r1 = insertRecipe.run('Spaghetti Carbonara', 'spaghetti-carbonara', 'Classic Italian pasta with eggs, cheese, and pancetta', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600', 10, 20, 4);
    insertIngredient.run(r1.lastInsertRowid, 'Spaghetti', '400', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Pancetta', '200', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Eggs', '4', 'pcs');
    insertIngredient.run(r1.lastInsertRowid, 'Parmesan', '100', 'g');
    insertStep.run(r1.lastInsertRowid, 1, 'Boil pasta in salted water');
    insertStep.run(r1.lastInsertRowid, 2, 'Fry pancetta until crispy');
    insertStep.run(r1.lastInsertRowid, 3, 'Mix eggs and parmesan');
    insertStep.run(r1.lastInsertRowid, 4, 'Combine pasta with pancetta, then add egg mixture off heat');

    const r2 = insertRecipe.run('Chicken Stir Fry', 'chicken-stir-fry', 'Quick and healthy chicken with vegetables', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600', 15, 15, 3);
    insertIngredient.run(r2.lastInsertRowid, 'Chicken Breast', '500', 'g');
    insertIngredient.run(r2.lastInsertRowid, 'Bell Pepper', '2', 'pcs');
    insertIngredient.run(r2.lastInsertRowid, 'Soy Sauce', '3', 'tbsp');
    insertIngredient.run(r2.lastInsertRowid, 'Garlic', '3', 'cloves');
    insertStep.run(r2.lastInsertRowid, 1, 'Slice chicken and vegetables');
    insertStep.run(r2.lastInsertRowid, 2, 'Stir fry chicken until golden');
    insertStep.run(r2.lastInsertRowid, 3, 'Add vegetables and soy sauce, cook 5 minutes');

    const r3 = insertRecipe.run('Avocado Toast', 'avocado-toast', 'Simple and delicious breakfast staple', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600', 5, 5, 2);
    insertIngredient.run(r3.lastInsertRowid, 'Avocado', '2', 'pcs');
    insertIngredient.run(r3.lastInsertRowid, 'Bread', '4', 'slices');
    insertIngredient.run(r3.lastInsertRowid, 'Lemon', '1', 'pcs');
    insertIngredient.run(r3.lastInsertRowid, 'Salt', '1', 'pinch');
    insertStep.run(r3.lastInsertRowid, 1, 'Toast bread slices');
    insertStep.run(r3.lastInsertRowid, 2, 'Mash avocado with lemon and salt');
    insertStep.run(r3.lastInsertRowid, 3, 'Spread on toast and serve');
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}