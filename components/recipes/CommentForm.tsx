"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentFormProps {
  recipeId: string;
  currentUserId: string;
}

export default function CommentForm({ recipeId, currentUserId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("recipe_comments").insert({
      recipe_id: recipeId,
      user_id: currentUserId,
      body: body.trim(),
    });
    setBody("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Skriv en kommentar..."
        rows={2}
        maxLength={2000}
        className="flex-1 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none text-[#1A1A1A]"
      />
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="self-end bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Send"}
      </button>
    </form>
  );
}
