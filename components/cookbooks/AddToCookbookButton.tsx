"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CookbookOption {
  id: string;
  title: string;
}

interface AddToCookbookButtonProps {
  recipeId: string;
  currentUserId: string | null;
  cookbooks: CookbookOption[];
  initialMembershipCookbookIds: string[];
}

export default function AddToCookbookButton({
  recipeId,
  currentUserId,
  cookbooks,
  initialMembershipCookbookIds,
}: AddToCookbookButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [bookList, setBookList] = useState(cookbooks);
  const [membership, setMembership] = useState(new Set(initialMembershipCookbookIds));
  const [draftMembership, setDraftMembership] = useState<Set<string> | null>(null);

  const selectedCount = useMemo(
    () => bookList.filter((book) => membership.has(book.id)).length,
    [bookList, membership]
  );

  function toggleCookbook(cookbookId: string) {
    if (!draftMembership || saving) return;
    setDraftMembership((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      if (next.has(cookbookId)) {
        next.delete(cookbookId);
      } else {
        next.add(cookbookId);
      }
      return next;
    });
  }

  async function createCookbookAndAdd() {
    if (!currentUserId || saving || !newTitle.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("cookbooks")
      .insert({ user_id: currentUserId, title: newTitle.trim() })
      .select("id, title")
      .single();

    if (data) {
      setBookList((prev) => [{ id: data.id, title: data.title }, ...prev]);
      setDraftMembership((prev) => {
        const next = new Set(prev ?? membership);
        next.add(data.id);
        return next;
      });
      setNewTitle("");
    }

    setSaving(false);
  }

  async function confirmSelection() {
    if (!currentUserId || !draftMembership || saving) return;
    setSaving(true);
    const supabase = createClient();

    const toAdd = [...draftMembership].filter((id) => !membership.has(id));
    const toRemove = [...membership].filter((id) => !draftMembership.has(id));

    if (toAdd.length > 0) {
      await supabase.from("cookbook_recipes").insert(
        toAdd.map((cookbookId) => ({
          cookbook_id: cookbookId,
          recipe_id: recipeId,
        }))
      );
    }

    if (toRemove.length > 0) {
      await supabase
        .from("cookbook_recipes")
        .delete()
        .eq("recipe_id", recipeId)
        .in("cookbook_id", toRemove);
    }

    setMembership(new Set(draftMembership));
    setDraftMembership(null);
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!currentUserId) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-primary transition-colors"
      >
        Logg inn for å lagre i kokebok
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setDraftMembership(new Set(membership));
          setOpen(true);
        }}
        className="border border-border px-4 h-10 text-xs uppercase tracking-widest hover:border-primary transition-colors inline-flex items-center"
      >
        + Legg til i kokebok {selectedCount > 0 ? `(${selectedCount})` : ""}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/90 px-4 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setDraftMembership(null);
              setOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Legg til i kokebok</h3>
              <button
                onClick={() => {
                  if (!saving) {
                    setDraftMembership(null);
                    setOpen(false);
                  }
                }}
                className="text-2xl leading-none text-muted"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ny kokebok..."
                className="flex-1 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={createCookbookAndAdd}
                disabled={saving || !newTitle.trim()}
                className="bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark disabled:opacity-50"
              >
                Opprett
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {bookList.length === 0 ? (
                <p className="text-sm text-muted">Du har ingen kokebøker ennå.</p>
              ) : (
                bookList.map((book) => {
                  const selected = draftMembership?.has(book.id) ?? membership.has(book.id);
                  return (
                    <button
                      key={book.id}
                      onClick={() => toggleCookbook(book.id)}
                      disabled={saving}
                      className={`w-full text-left border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {book.title} {selected ? "✓" : ""}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={confirmSelection}
                disabled={saving}
                className="bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? "Lagrer..." : "Bekreft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
