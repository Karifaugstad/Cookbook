"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UserAvatar from "@/components/profile/UserAvatar";
import { PendingRequest } from "@/lib/social";
import Link from "next/link";

interface FriendRequestListProps {
  requests: PendingRequest[];
}

export default function FriendRequestList({ requests }: FriendRequestListProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function accept(friendshipId: string) {
    setLoading(friendshipId);
    const supabase = createClient();
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    setDismissed((prev) => new Set(prev).add(friendshipId));
    setLoading(null);
    router.refresh();
  }

  async function decline(friendshipId: string) {
    setLoading(friendshipId);
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setDismissed((prev) => new Set(prev).add(friendshipId));
    setLoading(null);
  }

  const visible = requests.filter((r) => !dismissed.has(r.id));

  if (visible.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-sm uppercase tracking-widest text-muted mb-4">
        Innkommende forespørsler ({visible.length})
      </h2>
      <div className="space-y-3">
        {visible.map((req) => (
          <div
            key={req.id}
            className="flex items-center gap-4 border border-border px-4 py-3"
          >
            <UserAvatar profile={req.profile} size={36} />
            <div className="flex-1 min-w-0">
              <Link
                href={`/brukere/${req.profile.username}`}
                className="text-sm font-bold hover:text-primary transition-colors"
              >
                {req.profile.display_name}
              </Link>
              <p className="text-xs text-muted">@{req.profile.username}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => accept(req.id)}
                disabled={loading === req.id}
                className="text-xs uppercase tracking-widest bg-primary text-white px-3 py-1.5 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading === req.id ? "..." : "Godta"}
              </button>
              <button
                onClick={() => decline(req.id)}
                disabled={loading === req.id}
                className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 hover:border-primary transition-colors disabled:opacity-50"
              >
                Avslå
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
