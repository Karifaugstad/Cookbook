import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/lib/types";
import { getSupabaseImageUrl } from "@/lib/utils";
import UserAvatar from "@/components/profile/UserAvatar";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "akkurat nå";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}t`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}u`;
}

interface RecipeCardProps {
  recipe: Recipe;
  showAuthor?: boolean;
}

export default function RecipeCard({ recipe, showAuthor = false }: RecipeCardProps) {
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

      {showAuthor && recipe.profiles && (
        <div className="px-4 pb-3 pt-3 flex items-center gap-2 border-t border-border mt-1">
          <UserAvatar profile={recipe.profiles} size={18} />
          <span className="text-xs text-muted truncate">
            {recipe.profiles.display_name}
          </span>
          <span className="text-xs text-muted ml-auto shrink-0">
            {timeAgo(recipe.created_at)}
          </span>
        </div>
      )}
    </Link>
  );
}
