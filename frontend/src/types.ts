export interface Recipe {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: string;
  unit?: string;
}

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  instruction: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
  recipe_id?: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: Omit<RecipeIngredient, 'recipe_id'>[];
  steps: Omit<RecipeStep, 'recipe_id'>[];
}