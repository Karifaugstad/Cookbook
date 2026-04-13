"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSetupPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUserId(user.id);
        setChecking(false);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .neq("id", userId)
      .single();

    if (existing) {
      setError("Brukernavnet er allerede tatt. Prøv et annet.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username.toLowerCase(),
        display_name: displayName,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push("/profil");
      router.refresh();
    }
  }

  function handleUsernameChange(value: string) {
    setUsername(value.replace(/[^a-z0-9_-]/gi, "").toLowerCase());
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">Laster...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-[#1A1A1A]">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">Sett opp profilen din</h1>
        <p className="text-center text-sm text-muted mb-8">
          Velg brukernavn og visningsnavn
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
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="karinordmann"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-muted mt-1">
              Kun bokstaver, tall, - og _. Kan ikke endres senere.
            </p>
          </div>

          {error && <p className="text-primary text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full bg-primary text-white py-2 text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Lagrer..." : "Fullfør registrering"}
          </button>
        </form>
      </div>
    </main>
  );
}
