import { Suspense } from "react";
import { getRecipes, getAllTags } from "@/lib/recipes";
import RecipeCard from "@/components/RecipeCard";
import CategoryFilter from "@/components/CategoryFilter";
import TagFilter from "@/components/TagFilter";
import SearchBar from "@/components/SearchBar";
import RandomRecipeButton from "@/components/RandomRecipeButton";
import HeroHeader from "@/components/HeroHeader";
import type { Category } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validCategories: Category[] = ["breakfast", "lunch", "dinner"];
  const activeCategory =
    params.category && validCategories.includes(params.category as Category)
      ? (params.category as Category)
      : undefined;

  const [recipes, allTags] = await Promise.all([
    getRecipes({
      category: activeCategory,
      search: params.search,
      tag: params.tag,
    }),
    getAllTags(),
  ]);

  return (
    <main className="min-h-screen">
      <HeroHeader />

      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-5">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>

        {/* Category + tag filters */}
        <div className="flex flex-col gap-3 mb-8">
          <Suspense>
            <CategoryFilter active={activeCategory ?? "all"} />
          </Suspense>
          <Suspense>
            <TagFilter tags={allTags} active={params.tag ?? null} />
          </Suspense>
        </div>

        {/* Random recipe */}
        <div className="mb-8">
          <Suspense>
            <RandomRecipeButton
              recipes={recipes.map((r) => ({ title: r.title, slug: r.slug }))}
            />
          </Suspense>
        </div>

        {/* Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <p className="text-2xl font-bold mb-2">Ingen oppskrifter funnet.</p>
            <p className="text-sm">Prøv et annet søk eller filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
