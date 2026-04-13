import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfileByUsername } from "@/lib/profiles";
import { getFriendshipStatus, getFriends } from "@/lib/social";
import { getRecipesByUserId } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/AppNav";
import UserAvatar from "@/components/profile/UserAvatar";
import RecipeFeed from "@/components/RecipeFeed";
import FriendRequestButton from "@/components/friends/FriendRequestButton";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const [profile, supabase] = await Promise.all([
    getProfileByUsername(username),
    createClient(),
  ]);

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnProfile = user?.id === profile.id;

  const [{ status, friendshipId }, friends, recipes] = await Promise.all([
    user && !isOwnProfile
      ? getFriendshipStatus(user.id, profile.id)
      : Promise.resolve({ status: "none" as const, friendshipId: null }),
    getFriends(profile.id),
    getRecipesByUserId(profile.id),
  ]);

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profilhode */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="shrink-0">
            <UserAvatar profile={profile} size={96} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
              {profile.display_name}
            </h1>
            <p className="text-muted text-sm mb-3">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-[#1A1A1A] leading-relaxed mb-4 max-w-sm">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm mb-4">
              <span className="text-[#1A1A1A]">
                <span className="font-bold">{recipes.length}</span>{" "}
                <span className="text-muted">oppskrifter</span>
              </span>
              <span className="text-[#1A1A1A]">
                <span className="font-bold">{friends.length}</span>{" "}
                <span className="text-muted">venner</span>
              </span>
            </div>

            {!isOwnProfile && (
              <FriendRequestButton
                targetUserId={profile.id}
                currentUserId={user?.id ?? null}
                initialStatus={status}
                initialFriendshipId={friendshipId}
              />
            )}

            {isOwnProfile && (
              <Link
                href="/profil/rediger"
                className="inline-block text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-primary transition-colors"
              >
                Rediger profil
              </Link>
            )}
          </div>
        </section>

        <div className="border-t border-border mb-8" />

        <h2 className="text-sm uppercase tracking-widest text-muted mb-4">
          Oppskrifter
        </h2>
        <RecipeFeed
          recipes={recipes}
          emptyMessage={`${profile.display_name} har ingen oppskrifter ennå.`}
        />
      </div>
    </main>
  );
}
