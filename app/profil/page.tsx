import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/profiles";
import { getFriends } from "@/lib/social";
import { getMyRecipes } from "@/lib/recipes";
import AppNav from "@/components/AppNav";
import UserAvatar from "@/components/profile/UserAvatar";
import RecipeFeed from "@/components/RecipeFeed";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const { search } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, friends, recipes] = await Promise.all([
    getCurrentUserProfile(),
    getFriends(user.id),
    getMyRecipes({ search }),
  ]);

  if (!profile) redirect("/profil/sett-opp");

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profilhode */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          {/* Avatar */}
          <div className="shrink-0">
            <UserAvatar profile={profile} size={96} />
          </div>

          {/* Info */}
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
            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
              <span className="text-[#1A1A1A]">
                <span className="font-bold">{recipes.length}</span>{" "}
                <span className="text-muted">oppskrifter</span>
              </span>
              <Link
                href="/venner"
                className="text-[#1A1A1A] hover:text-primary transition-colors"
              >
                <span className="font-bold">{friends.length}</span>{" "}
                <span className="text-muted">venner</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="border-t border-border mb-8" />

        {/* Verktøylinje */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form method="GET" className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Søk i mine oppskrifter..."
              className="w-full border border-border bg-transparent pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary placeholder:text-muted text-[#1A1A1A]"
            />
          </form>

          <Link
            href="/admin/new"
            className="shrink-0 bg-primary text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors text-center"
          >
            + Ny oppskrift
          </Link>
        </div>

        {/* Oppskriftsgrid */}
        <RecipeFeed
          recipes={recipes}
          emptyMessage={search ? `Ingen treff på "${search}".` : "Ingen oppskrifter ennå."}
          emptySubMessage={search ? undefined : "Del din første oppskrift!"}
        />
      </div>
    </main>
  );
}
