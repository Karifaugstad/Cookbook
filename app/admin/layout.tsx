import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen text-[#1A1A1A]">
      <header className="border-b border-border px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-xl">
            Mine oppskrifter
          </Link>
          <span className="text-muted text-sm">/</span>
          <Link
            href="/admin"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/new"
            className="text-xs uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-primary-dark transition-colors"
          >
            + Ny oppskrift
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
