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
      description TEXT,
      image_url TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      instructions TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      checked INTEGER NOT NULL DEFAULT 0,
      recipe_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get();
  if (count.c === 0) {
    const insertRecipe = db.prepare('INSERT INTO recipes (title, description, prep_time, cook_time, servings, instructions) VALUES (?, ?, ?, ?, ?, ?)');
    const insertIngredient = db.prepare('INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)');

    const r1 = insertRecipe.run('Classic Spaghetti Bolognese', 'A hearty Italian meat sauce over pasta', 15, 45, 4, '1. Brown the mince\n2. Add onion and garlic\n3. Add tomatoes and simmer\n4. Cook pasta\n5. Serve');
    insertIngredient.run(r1.lastInsertRowid, 'Spaghetti', '400', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Ground Beef', '500', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Canned Tomatoes', '2', 'cans');

    const r2 = insertRecipe.run('Chicken Stir Fry', 'Quick weeknight stir fry with vegetables', 10, 15, 2, '1. Slice chicken\n2. Stir fry vegetables\n3. Add sauce\n4. Serve over rice');
    insertIngredient.run(r2.lastInsertRowid, 'Chicken Breast', '300', 'g');
    insertIngredient.run(r2.lastInsertRowid, 'Bell Pepper', '2', 'pcs');
    insertIngredient.run(r2.lastInsertRowid, 'Soy Sauce', '3', 'tbsp');

    const r3 = insertRecipe.run('Avocado Toast', 'Simple and delicious breakfast', 5, 5, 1, '1. Toast bread\n2. Mash avocado\n3. Spread on toast\n4. Season with salt and pepper');
    insertIngredient.run(r3.lastInsertRowid, 'Bread', '2', 'slices');
    insertIngredient.run(r3.lastInsertRowid, 'Avocado', '1', 'pcs');
  }

  return db;
}

// Helper to check if db is supabase client
export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}