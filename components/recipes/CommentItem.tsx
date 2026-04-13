"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/profile/UserAvatar";
import { RecipeComment } from "@/lib/types";

interface CommentItemProps {
  comment: RecipeComment;
  currentUserId: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "akkurat nå";
  if (mins < 60) return `${mins} min siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  return `${days} d siden`;
}

export default function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();
  const isOwn = currentUserId === comment.user_id;
  const profile = comment.profiles;

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("recipe_comments").delete().eq("id", comment.id);
    setDeleted(true);
    router.refresh();
  }

  if (deleted) return null;

  return (
    <div className="flex gap-3">
      {profile && (
        <div className="flex-shrink-0 mt-0.5">
          <UserAvatar
            profile={{ display_name: profile.display_name, avatar_url: profile.avatar_url }}
            size={30}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-bold text-[#1A1A1A]">
            {profile?.display_name ?? "Ukjent"}
          </span>
          <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
          {isOwn && (
            <button
              onClick={handleDelete}
              className="ml-auto text-xs text-muted hover:text-primary transition-colors"
            >
              Slett
            </button>
          )}
        </div>
        <p className="text-sm text-[#1A1A1A] leading-relaxed">{comment.body}</p>
      </div>
    </div>
  );
}
