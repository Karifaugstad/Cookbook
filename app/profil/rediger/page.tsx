import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/profiles";
import EditProfileForm from "@/components/profile/EditProfileForm";
import LogoutButton from "@/components/admin/LogoutButton";
import Link from "next/link";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/profil/sett-opp");

  return (
    <main className="min-h-screen text-[#1A1A1A]">
      <header className="border-b border-border px-6 py-5 flex items-center gap-4">
        <Link href="/profil" className="font-serif text-xl">
          ← Min profil
        </Link>
      </header>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">Innstillinger</h1>
        <EditProfileForm profile={profile} />

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Konto</p>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
