import { createClient } from "./supabase/server";
import type { Category, Recipe } from "./types";

export async function getRecipes(options?: {
  category?: Category;
  search?: string;
  tag?: string;
}): Promise<Recipe[]> {
  const supabase = await createClient();
  let query = supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,ingredients.ilike.%${options.search}%`
    );
  }
  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Recipe[]) ?? [];
}

export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("tags")
    .eq("published", true);
  const all = (data ?? []).flatMap((r) => r.tags ?? []);
  return [...new Set(all)].sort();
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "*, recipe_photos(id, storage_key, sort_order), recipe_links(id, url, label, sort_order)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data as Recipe;
}

export async function getAllRecipesAdmin(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Recipe[]) ?? [];
}

export async function getRecipeBySlugAdmin(
  slug: string
): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "*, recipe_photos(id, storage_key, sort_order), recipe_links(id, url, label, sort_order)"
    )
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
