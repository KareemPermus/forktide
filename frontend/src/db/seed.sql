INSERT INTO recipes (title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings)
VALUES ('Spaghetti Carbonara', 'spaghetti-carbonara', 'Classic Italian pasta with eggs, cheese, and pancetta', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600', 10, 20, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings)
VALUES ('Chicken Stir Fry', 'chicken-stir-fry', 'Quick and healthy chicken with vegetables', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600', 15, 15, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings)
VALUES ('Avocado Toast', 'avocado-toast', 'Simple and delicious breakfast staple', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600', 5, 5, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, v.name, v.quantity, v.unit
FROM recipes r, (VALUES ('Spaghetti', '400', 'g'), ('Pancetta', '200', 'g'), ('Eggs', '4', 'pcs'), ('Parmesan', '100', 'g')) AS v(name, quantity, unit)
WHERE r.slug = 'spaghetti-carbonara'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = v.name);

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, v.name, v.quantity, v.unit
FROM recipes r, (VALUES ('Chicken Breast', '500', 'g'), ('Bell Pepper', '2', 'pcs'), ('Soy Sauce', '3', 'tbsp'), ('Garlic', '3', 'cloves')) AS v(name, quantity, unit)
WHERE r.slug = 'chicken-stir-fry'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = v.name);

INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit)
SELECT r.id, v.name, v.quantity, v.unit
FROM recipes r, (VALUES ('Avocado', '2', 'pcs'), ('Bread', '4', 'slices'), ('Lemon', '1', 'pcs'), ('Salt', '1', 'pinch')) AS v(name, quantity, unit)
WHERE r.slug = 'avocado-toast'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.name = v.name);

INSERT INTO recipe_steps (recipe_id, step_number, instruction)
SELECT r.id, v.step_number, v.instruction
FROM recipes r, (VALUES (1, 'Boil pasta in salted water'), (2, 'Fry pancetta until crispy'), (3, 'Mix eggs and parmesan'), (4, 'Combine pasta with pancetta, then add egg mixture off heat')) AS v(step_number, instruction)
WHERE r.slug = 'spaghetti-carbonara'
AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id = r.id AND rs.step_number = v.step_number);

INSERT INTO recipe_steps (recipe_id, step_number, instruction)
SELECT r.id, v.step_number, v.instruction
FROM recipes r, (VALUES (1, 'Slice chicken and vegetables'), (2, 'Stir fry chicken until golden'), (3, 'Add vegetables and soy sauce, cook 5 minutes')) AS v(step_number, instruction)
WHERE r.slug = 'chicken-stir-fry'
AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id = r.id AND rs.step_number = v.step_number);

INSERT INTO recipe_steps (recipe_id, step_number, instruction)
SELECT r.id, v.step_number, v.instruction
FROM recipes r, (VALUES (1, 'Toast bread slices'), (2, 'Mash avocado with lemon and salt'), (3, 'Spread on toast and serve')) AS v(step_number, instruction)
WHERE r.slug = 'avocado-toast'
AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id = r.id AND rs.step_number = v.step_number);