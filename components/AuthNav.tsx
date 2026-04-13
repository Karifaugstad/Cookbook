import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex items-center gap-5 z-10">
        <Link
          href="/profil"
          className="text-xs text-muted hover:text-primary transition-colors uppercase tracking-widest"
        >
          Min profil
        </Link>
        <Link
          href="/admin"
          className="text-xs text-muted hover:text-primary transition-colors uppercase tracking-widest"
        >
          Mine oppskrifter
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 z-10">
      <Link
        href="/login"
        className="text-xs text-muted hover:text-primary transition-colors uppercase tracking-widest"
      >
        Logg inn
      </Link>
      <Link
        href="/registrer"
        className="text-xs text-muted hover:text-primary transition-colors uppercase tracking-widest"
      >
        Registrer deg
      </Link>
    </div>
  );
}
