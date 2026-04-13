import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/lib/types";

interface RecipeFeedProps {
  recipes: Recipe[];
  showAuthor?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

/**
 * Delt komponent for å vise et rutenett av oppskrifter.
 * Brukes på feed-siden, profilsider og offentlige brukerprofiler.
 */
export default function RecipeFeed({
  recipes,
  showAuthor = false,
  emptyMessage = "Ingen oppskrifter funnet.",
  emptySubMessage,
}: RecipeFeedProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-24 text-muted">
        <p className="text-2xl font-bold mb-2">{emptyMessage}</p>
        {emptySubMessage && <p className="text-sm">{emptySubMessage}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} showAuthor={showAuthor} />
      ))}
    </div>
  );
}
