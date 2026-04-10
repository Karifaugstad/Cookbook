import Link from "next/link";

export default function HeroHeader() {
  return (
    <header className="relative border-b border-border overflow-hidden flex items-center justify-center" style={{ minHeight: "320px" }}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/header-bg.png')" }}
      />

      {/* Title */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mine oppskrifter</h1>
      </div>

      {/* Admin link */}
      <Link
        href="/admin"
        className="absolute top-5 right-6 text-xs text-muted hover:text-primary transition-colors uppercase tracking-widest z-10"
      >
        Admin
      </Link>
    </header>
  );
}
