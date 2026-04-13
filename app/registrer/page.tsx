"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleUsernameChange(value: string) {
    setUsername(value.replace(/[^a-z0-9_-]/gi, "").toLowerCase());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    // Sjekk om brukernavn er tatt
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("Brukernavnet er allerede tatt. Prøv et annet.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      // Innlogget direkte — oppdater profil og send til /profil
      await supabase
        .from("profiles")
        .update({ display_name: displayName, username })
        .eq("id", data.user.id);

      router.push("/profil");
      router.refresh();
    } else {
      // E-postbekreftelse er på — vis melding
      setEmailSent(true);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-[#1A1A1A]">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="font-serif text-2xl mb-3">Sjekk e-posten din</h1>
          <p className="text-sm text-muted mb-6">
            Vi har sendt en bekreftelseslenke til <strong>{email}</strong>.
            Klikk på lenken for å aktivere kontoen din, og logg deretter inn.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors"
          >
            Gå til innlogging
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-[#1A1A1A]">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">Opprett konto</h1>
        <p className="text-center text-sm text-muted mb-8">
          Bli med i oppskriftssamfunnet
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs uppercase tracking-widest text-muted mb-1"
            >
              Visningsnavn
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kari Nordmann"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-xs uppercase tracking-widest text-muted mb-1"
            >
              Brukernavn
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="karinordmann"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-muted mt-1">
              Kun bokstaver, tall, - og _. Kan ikke endres senere.
            </p>
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-primary text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full bg-primary text-white py-2 text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Oppretter konto..." : "Registrer deg"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Har du allerede konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Logg inn
          </Link>
        </p>
      </div>
    </main>
  );
}
