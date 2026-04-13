import { createClient } from "@/lib/supabase/server";
import type { Cookbook, Recipe } from "@/lib/types";

type CookbookWithCount = Cookbook & { recipe_count: number };

async function attachProfiles(recipes: Recipe[]): Promise<Recipe[]> {
  if (recipes.length === 0) return recipes;

  const supabase = await createClient();
  const uniqueUserIds = [...new Set(recipes.map((recipe) => recipe.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", uniqueUserIds);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return recipes.map((recipe) => {
    const author = profileById.get(recipe.user_id);
    return {
      ...recipe,
      profiles: author
        ? {
            username: author.username,
            display_name: author.display_name,
            avatar_url: author.avatar_url,
          }
        : undefined,
    };
  });
}

export async function getCookbooksForUser(userId: string): Promise<CookbookWithCount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cookbooks")
    .select("id, user_id, title, description, cover_storage_key, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const cookbooks = (data as Cookbook[]) ?? [];
  if (cookbooks.length === 0) return [];

  const cookbookIds = cookbooks.map((book) => book.id);
  const { data: rows } = await supabase
    .from("cookbook_recipes")
    .select("cookbook_id")
    .in("cookbook_id", cookbookIds);

  const countByCookbookId = new Map<string, number>();
  for (const row of rows ?? []) {
    countByCookbookId.set(
      row.cookbook_id,
      (countByCookbookId.get(row.cookbook_id) ?? 0) + 1
    );
  }

  return cookbooks.map((book) => ({
    ...book,
    recipe_count: countByCookbookId.get(book.id) ?? 0,
  }));
}

export async function getCookbookByIdForUser(
  userId: string,
  cookbookId: string
): Promise<Cookbook | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cookbooks")
    .select("id, user_id, title, description, cover_storage_key, created_at")
    .eq("id", cookbookId)
    .eq("user_id", userId)
    .maybeSingle();

  return (data as Cookbook | null) ?? null;
}

export async function getRecipeIdsForCookbook(cookbookId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cookbook_recipes")
    .select("recipe_id")
    .eq("cookbook_id", cookbookId);

  return [...new Set((data ?? []).map((row) => row.recipe_id))];
}

export async function getCookbookRecipesForUser(
  userId: string,
  cookbookId: string
): Promise<Recipe[]> {
  const cookbook = await getCookbookByIdForUser(userId, cookbookId);
  if (!cookbook) return [];

  const recipeIds = await getRecipeIdsForCookbook(cookbookId);
  if (recipeIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .eq("published", true)
    .in("id", recipeIds)
    .order("created_at", { ascending: false });

  return attachProfiles((data as Recipe[]) ?? []);
}

export async function getCollectedRecipesForUser(userId: string): Promise<Recipe[]> {
  const supabase = await createClient();
  const cookbooks = await getCookbooksForUser(userId);
  const cookbookIds = cookbooks.map((book) => book.id);

  let collectedRecipeIds: string[] = [];
  if (cookbookIds.length > 0) {
    const { data: cookbookRecipes } = await supabase
      .from("cookbook_recipes")
      .select("recipe_id")
      .in("cookbook_id", cookbookIds);
    collectedRecipeIds = (cookbookRecipes ?? []).map((row) => row.recipe_id);
  }

  const { data: ownRecipes } = await supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .eq("published", true)
    .eq("user_id", userId);

  const own = (ownRecipes as Recipe[]) ?? [];
  const ownIds = own.map((recipe) => recipe.id);
  const allIds = [...new Set([...ownIds, ...collectedRecipeIds])];

  if (allIds.length === 0) return [];

  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .eq("published", true)
    .in("id", allIds)
    .order("created_at", { ascending: false });

  return attachProfiles((allRecipes as Recipe[]) ?? []);
}

export async function getCookbookMembershipForRecipe(
  userId: string,
  recipeId: string
): Promise<string[]> {
  const cookbooks = await getCookbooksForUser(userId);
  if (cookbooks.length === 0) return [];

  const cookbookIds = cookbooks.map((book) => book.id);
  const supabase = await createClient();
  const { data } = await supabase
    .from("cookbook_recipes")
    .select("cookbook_id")
    .eq("recipe_id", recipeId)
    .in("cookbook_id", cookbookIds);

  return (data ?? []).map((row) => row.cookbook_id);
}
