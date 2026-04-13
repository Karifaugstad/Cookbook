import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/profiles";
import AppNavLinks from "@/components/AppNavLinks";

export default async function AppNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getCurrentUserProfile() : null;

  return (
    <nav className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link
          href="/"
          className="font-bold text-base sm:text-lg shrink-0 hover:text-primary transition-colors"
        >
          Oppskrifter
        </Link>

        <div className="flex-1" />

        <AppNavLinks
          isLoggedIn={!!user}
          profile={
            profile
              ? { display_name: profile.display_name, avatar_url: profile.avatar_url }
              : null
          }
        />
      </div>
    </nav>
  );
}
