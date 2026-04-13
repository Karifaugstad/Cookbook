import { createClient as createServerClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  return data ?? null;
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<Profile, "username" | "display_name" | "bio" | "avatar_url">>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);

  return data ?? [];
}

export async function isUsernameTaken(
  supabase: SupabaseClient,
  username: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.single();
  return !!data;
}
