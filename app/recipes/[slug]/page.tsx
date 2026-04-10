import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/recipes";
import { getSupabaseImageUrl } from "@/lib/utils";
import CopyIngredientsButton from "@/components/CopyIngredientsButton";
import CopyCurrentUrlButton from "@/components/CopyCurrentUrlButton";
import ServingsScaler from "@/components/ServingsScaler";
import NutritionInfo from "@/components/NutritionInfo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};
  return {
    title: `${recipe.title} — Mine oppskrifter`,
    description: recipe.instructions.slice(0, 160),
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const photos = (recipe.recipe_photos ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const links = (recipe.recipe_links ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const categoryLabels: Record<string, string> = {
    breakfast: "Frokost",
    lunch: "Lunsj",
    dinner: "Middag",
  };
  const categoryLabel = categoryLabels[recipe.category] ?? recipe.category;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          ← Alle oppskrifter
        </Link>
        <span className="text-xs text-primary uppercase tracking-widest font-medium">
          {categoryLabel}
        </span>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-3">
          {recipe.title}
        </h1>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs border border-border px-2 py-0.5 text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div
            className={`mb-8 grid gap-3 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className={`relative overflow-hidden bg-border ${
                  photos.length === 1
                    ? "aspect-[16/9]"
                    : i === 0 && photos.length >= 3
                      ? "col-span-2 aspect-[16/7]"
                      : "aspect-square"
                }`}
              >
                <Image
                  src={getSupabaseImageUrl(photo.storage_key)}
                  alt={`${recipe.title} bilde ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_2fr] gap-10">
          {/* Ingredients */}
          <section>
            <h2 className="text-2xl font-bold mb-3">Ingredienser</h2>
            {recipe.servings ? (
              <ServingsScaler
                originalServings={recipe.servings}
                ingredients={recipe.ingredients}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-7 font-sans text-foreground">
                {recipe.ingredients}
              </pre>
            )}
            <div className="mt-4">
              <CopyIngredientsButton ingredients={recipe.ingredients} />
            </div>
          </section>

          {/* Instructions */}
          <section>
            <h2 className="text-2xl font-bold mb-3">Fremgangsmåte</h2>
            <pre className="whitespace-pre-wrap text-sm leading-7 font-sans text-foreground">
              {recipe.instructions}
            </pre>
          </section>
        </div>

        {/* Nutrition */}
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-4">Næringsinnhold</h2>
          <p className="text-xs text-muted mb-3">
            Per porsjon (beregnet automatisk — kan variere)
          </p>
          <NutritionInfo
            recipeId={recipe.id}
            ingredients={recipe.ingredients}
            initial={recipe.nutrition}
          />
        </section>

        {/* Notes */}
        {recipe.notes && (
          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-3">Mine notater</h2>
            <pre className="whitespace-pre-wrap text-sm leading-7 font-sans text-foreground">
              {recipe.notes}
            </pre>
          </section>
        )}

        {/* Source links */}
        {links.length > 0 && (
          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-3">Kilder</h2>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
          <span className="text-xs text-muted uppercase tracking-widest">
            Del oppskriften
          </span>
          <CopyCurrentUrlButton />
        </div>
      </article>
    </main>
  );
}
