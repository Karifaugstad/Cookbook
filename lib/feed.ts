import { createClient } from "@/lib/supabase/server";
import type { Category, Recipe } from "@/lib/types";

/** Alle publiserte oppskrifter — brukes for ikke-innloggede (discovery-view). */
export async function getDiscoveryRecipes(options?: {
  category?: Category;
  search?: string;
}): Promise<Recipe[]> {
  const supabase = await createClient();
  // Ingen profiles-join her: enklere spørring som garantert fungerer for anon-brukere
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

  const { data } = await query;
  return (data as Recipe[]) ?? [];
}

/** Oppskrifter fra venner (ikke egne) — brukes for innloggede brukere. */
export async function getFeedRecipes(options?: {
  category?: Category;
  search?: string;
}): Promise<Recipe[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: friendships } = await supabase
    .from("friendships")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  const friendIds = (friendships ?? []).map((f) =>
    f.sender_id === user.id ? f.receiver_id : f.sender_id
  );

  if (friendIds.length === 0) return [];

  let query = supabase
    .from("recipes")
    .select("*, recipe_photos(id, storage_key, sort_order)")
    .eq("published", true)
    .in("user_id", friendIds)
    .order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,ingredients.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const recipes = data as Recipe[];
  const uniqueUserIds = [...new Set(recipes.map((recipe) => recipe.user_id))];
  if (uniqueUserIds.length === 0) return recipes;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", uniqueUserIds);

  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );

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
