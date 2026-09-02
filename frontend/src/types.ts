export interface Recipe {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  instructions: string;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: string;
  unit?: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
  recipe_id?: number;
  created_at: string;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: Omit<RecipeIngredient, 'recipe_id'>[];
}

export interface RecipeListItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  created_at: string;
}

export interface DeleteResponse {
  success: boolean;
}

export interface ClearCheckedResponse {
  success: boolean;
  deleted_count: number;
}