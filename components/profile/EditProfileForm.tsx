"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import UserAvatar from "@/components/profile/UserAvatar";

interface EditProfileFormProps {
  profile: Profile;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vis preview umiddelbart
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    setError(null);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const storagePath = `avatars/${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-photos")
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      setError("Kunne ikke laste opp bilde: " + uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-photos/${storagePath}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: fullUrl })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.refresh();
    }
    setAvatarUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio: bio || null })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/profil");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profilbilde */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-3">
          Profilbilde
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group shrink-0"
            title="Klikk for å laste opp bilde"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserAvatar
                profile={{ display_name: displayName || profile.display_name, avatar_url: null }}
                size={80}
              />
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-primary transition-colors disabled:opacity-50"
            >
              {avatarUploading ? "Laster opp..." : "Velg bilde"}
            </button>
            <p className="text-xs text-muted mt-1">JPG, PNG eller WEBP</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Brukernavn (read-only) */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-1">
          Brukernavn
        </label>
        <p className="text-sm border border-border px-3 py-2 bg-background text-muted">
          @{profile.username}
        </p>
        <p className="text-xs text-muted mt-1">Brukernavn kan ikke endres.</p>
      </div>

      {/* Visningsnavn */}
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
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-xs uppercase tracking-widest text-muted mb-1"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={300}
          placeholder="Fortell litt om deg selv og matlaging..."
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {error && <p className="text-primary text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="bg-primary text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Lagrer..." : "Lagre"}
        </button>
        <a
          href="/profil"
          className="px-6 py-2 text-sm uppercase tracking-widest border border-border hover:border-primary transition-colors"
        >
          Avbryt
        </a>
      </div>
    </form>
  );
}
