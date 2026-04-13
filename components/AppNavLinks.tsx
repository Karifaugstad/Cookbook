"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import UserAvatar from "@/components/profile/UserAvatar";
import type { Profile } from "@/lib/types";

interface AppNavLinksProps {
  isLoggedIn: boolean;
  profile: Pick<Profile, "display_name" | "avatar_url"> | null;
}

function HouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AddFriendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function AppNavLinks({ isLoggedIn, profile }: AppNavLinksProps) {
  const pathname = usePathname();

  const navLink = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `flex items-center gap-2 px-3 h-14 text-sm transition-colors border-b-2 ${
      active
        ? "text-primary font-medium border-primary"
        : "text-muted hover:text-primary border-transparent"
    }`;
  };

  const iconBtn =
    "p-2 text-muted hover:text-primary transition-colors rounded-sm";

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-muted hover:text-primary transition-colors">
          Logg inn
        </Link>
        <Link
          href="/registrer"
          className="text-sm bg-primary text-white px-4 py-1.5 hover:bg-primary-dark transition-colors"
        >
          Registrer deg
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Primær nav */}
      <Link href="/" className={navLink("/")}>
        <HouseIcon />
        <span className="hidden sm:inline">Feed</span>
      </Link>

      <Link href="/profil" className={navLink("/profil")}>
        {profile ? (
          <UserAvatar profile={profile} size={22} />
        ) : (
          <PersonIcon />
        )}
        <span className="hidden sm:inline">Profil</span>
      </Link>

      <Link href="/kokeboker" className={navLink("/kokeboker")}>
        <BookIcon />
        <span className="hidden sm:inline">Kokebøker</span>
      </Link>

      {/* Skillelinje */}
      <div className="w-px h-5 bg-border mx-2 hidden sm:block" />

      {/* Verktøy-ikoner */}
      <Link href="/venner/sok" title="Finn venner" className={iconBtn}>
        <AddFriendIcon />
      </Link>

      <Link href="/profil/rediger" title="Innstillinger" className={iconBtn}>
        <GearIcon />
      </Link>
    </div>
  );
}
