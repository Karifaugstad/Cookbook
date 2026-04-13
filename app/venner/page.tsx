import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPendingRequests, getFriends } from "@/lib/social";
import AppNav from "@/components/AppNav";
import FriendRequestList from "@/components/friends/FriendRequestList";
import UserAvatar from "@/components/profile/UserAvatar";

export default async function VennerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [pendingRequests, friends] = await Promise.all([
    getPendingRequests(user.id),
    getFriends(user.id),
  ]);

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Venner</h1>
          <Link
            href="/venner/sok"
            className="text-xs uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-primary-dark transition-colors"
          >
            Finn venner
          </Link>
        </div>

        <FriendRequestList requests={pendingRequests} />

        <section>
          <h2 className="text-sm uppercase tracking-widest text-muted mb-4">
            {friends.length > 0 ? `${friends.length} venner` : "Venner"}
          </h2>
          {friends.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              Du har ingen venner ennå.{" "}
              <Link href="/venner/sok" className="text-primary hover:underline">
                Søk etter folk
              </Link>{" "}
              for å komme i gang.
            </p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <Link
                  key={friend.id}
                  href={`/brukere/${friend.username}`}
                  className="flex items-center gap-4 border border-border px-4 py-3 hover:border-primary transition-colors"
                >
                  <UserAvatar profile={friend} size={36} />
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {friend.display_name}
                    </p>
                    <p className="text-xs text-muted">@{friend.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
