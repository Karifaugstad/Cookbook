import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/lib/types";
import { getSupabaseImageUrl } from "@/lib/utils";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const firstPhoto = recipe.recipe_photos
    ?.sort((a, b) => a.sort_order - b.sort_order)
    .at(0);

  const categoryLabels: Record<string, string> = {
    breakfast: "Frokost",
    lunch: "Lunsj",
    dinner: "Middag",
  };
  const categoryLabel = categoryLabels[recipe.category] ?? recipe.category;

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block border border-border hover:border-primary transition-colors"
    >
      <div className="aspect-[4/3] bg-border overflow-hidden relative">
        {firstPhoto ? (
          <Image
            src={getSupabaseImageUrl(firstPhoto.storage_key)}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl select-none">
            ✦
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-primary font-medium uppercase tracking-widest mb-1">
          {categoryLabel}
        </p>
        <h2 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">
          {recipe.title}
        </h2>
      </div>
    </Link>
  );
}
