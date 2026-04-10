"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteRecipeButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Slette "${title}"? Dette kan ikke angres.`)) return;
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-muted hover:text-primary transition-colors"
    >
      Slett
    </button>
  );
}
