import { createClient } from "@/lib/supabase/server";
import { Profile, RecipeComment } from "@/lib/types";

export type FriendshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted";

export interface FriendshipInfo {
  status: FriendshipStatus;
  friendshipId: string | null;
}

export interface PendingRequest {
  id: string;
  sender_id: string;
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
}

export async function getLikesForRecipe(
  recipeId: string
): Promise<{ count: number; userLiked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from("recipe_likes")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);

  let userLiked = false;
  if (user) {
    const { data } = await supabase
      .from("recipe_likes")
      .select("user_id")
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id)
      .single();
    userLiked = !!data;
  }

  return { count: count ?? 0, userLiked };
}

export async function getCommentsForRecipe(
  recipeId: string
): Promise<RecipeComment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipe_comments")
    .select("*, profiles(username, display_name, avatar_url)")
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: true });

  return (data as RecipeComment[]) ?? [];
}

export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<FriendshipInfo> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("friendships")
    .select("id, sender_id, status")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .maybeSingle();

  if (!data) return { status: "none", friendshipId: null };
  if (data.status === "accepted")
    return { status: "accepted", friendshipId: data.id };
  if (data.status === "pending") {
    return {
      status: data.sender_id === currentUserId ? "pending_sent" : "pending_received",
      friendshipId: data.id,
    };
  }
  return { status: "none", friendshipId: null };
}

export async function getPendingRequests(userId: string): Promise<PendingRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("friendships")
    .select("id, sender_id")
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (!data || data.length === 0) return [];

  const senderIds = data.map((f) => f.sender_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", senderIds);

  return data.map((f) => ({
    id: f.id,
    sender_id: f.sender_id,
    profile: profiles?.find((p) => p.id === f.sender_id) ?? {
      id: f.sender_id,
      username: "ukjent",
      display_name: "Ukjent bruker",
      avatar_url: null,
    },
  }));
}

export async function getFriends(userId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("friendships")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!data || data.length === 0) return [];

  const friendIds = data.map((f) =>
    f.sender_id === userId ? f.receiver_id : f.sender_id
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", friendIds);

  return (profiles as Profile[]) ?? [];
}
