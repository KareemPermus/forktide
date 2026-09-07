import type { Recipe, RecipeIngredient, RecipeStep, GroceryItem } from '@/types';

describe('Shared types', () => {
  it('Recipe type is valid', () => {
    const r: Recipe = { id: 1, title: 'Test', created_at: '2024-01-01' };
    expect(r.id).toBe(1);
  });

  it('GroceryItem type is valid', () => {
    const g: GroceryItem = { id: 1, name: 'Eggs', checked: false };
    expect(g.checked).toBe(false);
  });
});