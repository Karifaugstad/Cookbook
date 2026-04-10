"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { slugify, getSupabaseImageUrl } from "@/lib/utils";
import type { Category, Recipe, RecipePhoto } from "@/lib/types";
import TagInput from "./TagInput";

interface RecipeFormProps {
  recipe?: Recipe;
}

interface LinkInput {
  id?: string;
  url: string;
  label: string;
}

const CATEGORIES: Category[] = ["breakfast", "lunch", "dinner"];

export default function RecipeForm({ recipe }: RecipeFormProps) {
  const isEdit = !!recipe;
  const router = useRouter();

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [category, setCategory] = useState<Category>(
    recipe?.category ?? "dinner"
  );
  const [ingredients, setIngredients] = useState(recipe?.ingredients ?? "");
  const [instructions, setInstructions] = useState(
    recipe?.instructions ?? ""
  );
  const [notes, setNotes] = useState(recipe?.notes ?? "");
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? []);
  const [published, setPublished] = useState(recipe?.published ?? true);

  const [links, setLinks] = useState<LinkInput[]>(
    recipe?.recipe_links?.sort((a, b) => a.sort_order - b.sort_order).map((l) => ({
      id: l.id,
      url: l.url,
      label: l.label ?? "",
    })) ?? []
  );

  const [existingPhotos, setExistingPhotos] = useState<RecipePhoto[]>(
    recipe?.recipe_photos?.sort((a, b) => a.sort_order - b.sort_order) ?? []
  );
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeNewPhoto(index: number) {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingPhoto(photoId: string) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setPhotosToDelete((prev) => [...prev, photoId]);
  }

  function addLink() {
    setLinks((prev) => [...prev, { url: "", label: "" }]);
  }

  function updateLink(index: number, field: "url" | "label", value: string) {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const slug =
        recipe?.slug ??
        `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      let recipeId = recipe?.id;

      if (isEdit && recipeId) {
        // Update recipe
        const { error } = await supabase
          .from("recipes")
          .update({
            title,
            category,
            ingredients,
            instructions,
            notes: notes || null,
            servings,
            tags,
            published,
            updated_at: now,
          })
          .eq("id", recipeId);
        if (error) throw error;

        // Delete removed photos from DB (storage cleanup optional)
        for (const photoId of photosToDelete) {
          await supabase.from("recipe_photos").delete().eq("id", photoId);
        }

        // Delete all existing links and re-insert (simple approach)
        await supabase.from("recipe_links").delete().eq("recipe_id", recipeId);
      } else {
        // Create recipe
        const { data, error } = await supabase
          .from("recipes")
          .insert({
            slug,
            title,
            category,
            ingredients,
            instructions,
            notes: notes || null,
            servings,
            tags,
            published,
          })
          .select("id")
          .single();
        if (error) throw error;
        recipeId = data.id;
      }

      // Upload new photos
      const currentPhotoCount = existingPhotos.length;
      for (let i = 0; i < newPhotoFiles.length; i++) {
        const file = newPhotoFiles[i];
        const ext = file.name.split(".").pop();
        const key = `${recipeId}/${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("recipe-photos")
          .upload(key, file);
        if (uploadError) throw uploadError;
        await supabase.from("recipe_photos").insert({
          recipe_id: recipeId,
          storage_key: key,
          sort_order: currentPhotoCount + i,
        });
      }

      // Insert links
      const validLinks = links.filter((l) => l.url.trim());
      if (validLinks.length > 0) {
        await supabase.from("recipe_links").insert(
          validLinks.map((l, i) => ({
            recipe_id: recipeId,
            url: l.url.trim(),
            label: l.label.trim() || null,
            sort_order: i,
          }))
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : JSON.stringify(err);
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-1">
          Tittel *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary font-serif text-lg"
          placeholder="Oppskriftstittel"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          Kategori *
        </label>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 text-sm border transition-colors ${
                category === cat
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {{"breakfast":"Frokost","lunch":"Lunsj","dinner":"Middag"}[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          Porsjoner
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 border border-border hover:border-primary flex items-center justify-center text-lg transition-colors">−</button>
          <span className="text-sm w-20 text-center">{servings} {servings === 1 ? "porsjon" : "porsjoner"}</span>
          <button type="button" onClick={() => setServings(servings + 1)} className="w-8 h-8 border border-border hover:border-primary flex items-center justify-center text-lg transition-colors">+</button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          Tags
        </label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          Bilder
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-square bg-border">
              <Image
                src={getSupabaseImageUrl(photo.storage_key)}
                alt="Recipe photo"
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                type="button"
                onClick={() => removeExistingPhoto(photo.id)}
                className="absolute top-1 right-1 bg-primary text-white w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {newPhotoPreviews.map((preview, i) => (
            <div key={i} className="relative aspect-square bg-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="New photo preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute top-1 right-1 bg-primary text-white w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border border-dashed border-border hover:border-primary flex items-center justify-center text-muted hover:text-primary transition-colors text-2xl"
          >
            +
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-1">
          Ingredienser * <span className="normal-case">(én per linje)</span>
        </label>
        <textarea
          required
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={8}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y font-sans leading-7"
          placeholder={"400 g spaghetti\n1 ts salt\n..."}
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-1">
          Fremgangsmåte *
        </label>
        <textarea
          required
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={10}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y font-sans leading-7"
          placeholder="Steg 1: ..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-1">
          Mine notater{" "}
          <span className="normal-case text-muted">(justeringer, tips)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y font-sans leading-7"
          placeholder="Jeg bruker gjerne mer hvitløk..."
        />
      </div>

      {/* Links */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          Kilder / lenker
        </label>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Navn (valgfritt)"
                className="w-40 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-muted hover:text-primary transition-colors px-2 py-2 text-lg"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-primary hover:underline"
          >
            + Legg til lenke
          </button>
        </div>
      </div>

      {/* Published */}
      <div className="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-primary"
        />
        <label htmlFor="published" className="text-sm">
          Publisert (synlig for alle)
        </label>
      </div>

      {error && <p className="text-primary text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Lagrer..." : isEdit ? "Lagre endringer" : "Opprett oppskrift"}
        </button>
        <a
          href="/admin"
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          Avbryt
        </a>
      </div>
    </form>
  );
}
