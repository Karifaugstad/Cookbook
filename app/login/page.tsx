"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Feil e-post eller passord.");
      setLoading(false);
    } else {
      router.push("/profil");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-[#1A1A1A]">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl mb-8 text-center">Logg inn</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest text-muted mb-1"
            >
              E-post
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-widest text-muted mb-1"
            >
              Passord
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-primary text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Ikke registrert?{" "}
          <a href="/registrer" className="text-primary hover:underline">
            Opprett konto
          </a>
        </p>
      </div>
    </main>
  );
}
