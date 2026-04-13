import AuthNav from "@/components/AuthNav";

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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Oppskrifter</h1>
      </div>

      {/* Nav */}
      <div className="absolute top-5 right-6">
        <AuthNav />
      </div>
    </header>
  );
}
