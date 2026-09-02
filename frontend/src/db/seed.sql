INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, instructions)
VALUES ('Classic Spaghetti Bolognese', 'classic-spaghetti-bolognese', 'A hearty Italian meat sauce over pasta', 15, 45, 4, '1. Brown the mince
2. Add onion and garlic
3. Add tomatoes and simmer
4. Cook pasta
5. Serve')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, instructions)
VALUES ('Chicken Stir Fry', 'chicken-stir-fry', 'Quick weeknight stir fry with vegetables', 10, 15, 2, '1. Slice chicken
2. Stir fry vegetables
3. Add sauce
4. Serve over rice')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, instructions)
VALUES ('Avocado Toast', 'avocado-toast', 'Simple and delicious breakfast', 5, 5, 1, '1. Toast bread
2. Mash avocado
3. Spread on toast
4. Season with salt and pepper')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Spaghetti', '400', 'g' FROM recipes r WHERE r.slug = 'classic-spaghetti-bolognese'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Spaghetti');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Ground Beef', '500', 'g' FROM recipes r WHERE r.slug = 'classic-spaghetti-bolognese'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Ground Beef');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Canned Tomatoes', '2', 'cans' FROM recipes r WHERE r.slug = 'classic-spaghetti-bolognese'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Canned Tomatoes');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Chicken Breast', '300', 'g' FROM recipes r WHERE r.slug = 'chicken-stir-fry'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Chicken Breast');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Bell Pepper', '2', 'pcs' FROM recipes r WHERE r.slug = 'chicken-stir-fry'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Bell Pepper');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Soy Sauce', '3', 'tbsp' FROM recipes r WHERE r.slug = 'chicken-stir-fry'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Soy Sauce');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Bread', '2', 'slices' FROM recipes r WHERE r.slug = 'avocado-toast'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Bread');

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, 'Avocado', '1', 'pcs' FROM recipes r WHERE r.slug = 'avocado-toast'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = 'Avocado');