CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT
);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT false,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL
);