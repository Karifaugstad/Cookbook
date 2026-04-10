export type Category = "breakfast" | "lunch" | "dinner";

export interface RecipePhoto {
  id: string;
  recipe_id: string;
  storage_key: string;
  sort_order: number;
}

export interface RecipeLink {
  id: string;
  recipe_id: string;
  url: string;
  label: string | null;
  sort_order: number;
}

export interface Nutrition {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  category: Category;
  ingredients: string;
  instructions: string;
  notes: string | null;
  published: boolean;
  servings: number | null;
  tags: string[];
  nutrition: Nutrition | null;
  created_at: string;
  updated_at: string;
  recipe_photos?: RecipePhoto[];
  recipe_links?: RecipeLink[];
}
