"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CreateCookbookFormProps {
  currentUserId: string;
}

export default function CreateCookbookForm({ currentUserId }: CreateCookbookFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || loading) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      let coverStorageKey: string | null = null;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "jpg";
        coverStorageKey = `cookbooks/${currentUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("recipe-photos")
          .upload(coverStorageKey, coverFile, { upsert: true });
        if (uploadError) throw uploadError;
      }

      const payload: {
        user_id: string;
        title: string;
        description?: string;
        cover_storage_key?: string;
      } = {
        user_id: currentUserId,
        title: title.trim(),
        description: "",
      };
      if (coverStorageKey) payload.cover_storage_key = coverStorageKey;

      const { error: insertError } = await supabase.from("cookbooks").insert(payload);
      if (insertError) {
        // Fallback for databaser som ikke har fått cover-kolonnen ennå.
        if (insertError.message.includes("cover_storage_key")) {
          const { error: retryError } = await supabase.from("cookbooks").insert({
            user_id: currentUserId,
            title: title.trim(),
          });
          if (retryError) throw retryError;
        } else {
          throw insertError;
        }
      }

      setTitle("");
      setCoverFile(null);
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Kunne ikke opprette kokebok.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors"
      >
        + Opprett ny bok
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/90 px-4 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setOpen(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md border border-border bg-background p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest text-muted">Opprett ny kokebok</h3>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="text-2xl leading-none text-muted hover:text-primary"
              >
                ×
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Navn på kokebok..."
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />

            <div>
              <p className="text-xs text-muted mb-2">Cover (valgfritt)</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-primary transition-colors"
                >
                  Velg bilde
                </button>
                <span className="text-xs text-muted truncate">
                  {coverFile ? coverFile.name : "Ingen fil valgt"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>

            {error && <p className="text-xs text-primary">{error}</p>}

            <p className="text-xs text-muted">
              Uten bilde lages en automatisk forside med boktittel.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Oppretter..." : "Opprett bok"}
              </button>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-primary"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
