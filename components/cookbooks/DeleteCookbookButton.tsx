"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DeleteCookbookButtonProps {
  cookbookId: string;
}

export default function DeleteCookbookButton({ cookbookId }: DeleteCookbookButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    const confirmed = window.confirm(
      "Slette kokeboken? Dette fjerner også alle lagrede koblinger i boken."
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from("cookbooks").delete().eq("id", cookbookId);
    router.push("/kokeboker");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-primary transition-colors disabled:opacity-50"
    >
      {loading ? "Sletter..." : "Slett kokebok"}
    </button>
  );
}
