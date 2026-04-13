"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LikeButtonProps {
  recipeId: string;
  initialCount: number;
  initialLiked: boolean;
  currentUserId: string | null;
}

export default function LikeButton({
  recipeId,
  initialCount,
  initialLiked,
  currentUserId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    const supabase = createClient();
    if (liked) {
      await supabase
        .from("recipe_likes")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", currentUserId);
    } else {
      await supabase
        .from("recipe_likes")
        .insert({ recipe_id: recipeId, user_id: currentUserId });
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Fjern like" : "Lik oppskrift"}
      className={`flex items-center gap-2 text-sm transition-colors ${
        liked ? "text-primary" : "text-muted hover:text-primary"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
}
