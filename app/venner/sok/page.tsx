import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchProfiles } from "@/lib/profiles";
import AppNav from "@/components/AppNav";
import UserAvatar from "@/components/profile/UserAvatar";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SokVennerPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { q } = await searchParams;
  const results = q && q.trim().length >= 2 ? await searchProfiles(q.trim()) : [];
  const filtered = results.filter((p) => p.id !== user.id);

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Finn venner</h1>

        <form method="GET" className="flex gap-3 mb-8">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Søk på navn eller brukernavn..."
            autoFocus
            className="flex-1 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary text-[#1A1A1A]"
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors"
          >
            Søk
          </button>
        </form>

        {q && q.trim().length >= 2 ? (
          filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              Ingen brukere funnet for &ldquo;{q}&rdquo;.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/brukere/${profile.username}`}
                  className="flex items-center gap-4 border border-border px-4 py-3 hover:border-primary transition-colors"
                >
                  <UserAvatar profile={profile} size={36} />
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {profile.display_name}
                    </p>
                    <p className="text-xs text-muted">@{profile.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <p className="text-sm text-muted text-center py-8">
            Skriv minst 2 tegn for å søke.
          </p>
        )}
      </div>
    </main>
  );
}
