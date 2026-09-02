import type { Recipe, RecipeIngredient, GroceryItem } from '@/types';

describe('Shared types', () => {
  it('Recipe has required fields', () => {
    const r: Recipe = { id: 1, title: 'Test', instructions: 'Do it', created_at: '2025-01-01' };
    expect(r.id).toBe(1);
  });
  it('GroceryItem has checked field', () => {
    const g: GroceryItem = { id: 1, name: 'Milk', checked: false, created_at: '2025-01-01' };
    expect(g.checked).toBe(false);
  });
});