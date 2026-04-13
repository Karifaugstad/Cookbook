import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getFeedRecipes, getDiscoveryRecipes } from "@/lib/feed";
import RecipeFeed from "@/components/RecipeFeed";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import AppNav from "@/components/AppNav";
import type { Category } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validCategories: Category[] = ["breakfast", "lunch", "dinner"];
  const activeCategory =
    params.category && validCategories.includes(params.category as Category)
      ? (params.category as Category)
      : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Innlogget: vis kun venners oppskrifter (med forfatter-info)
  // Ikke innlogget: vis alle publiserte oppskrifter (discovery)
  const allRecipes = user
    ? await getFeedRecipes({ search: params.search })
    : await getDiscoveryRecipes({ search: params.search });

  const recipes = activeCategory
    ? allRecipes.filter((r) => r.category === activeCategory)
    : allRecipes;

  const emptySubMessage = (() => {
    if (params.search || activeCategory) return "Prøv et annet søk eller filter.";
    if (user) return "Legg til venner for å se oppskrifter i feeden din!";
    return undefined;
  })();

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Søk + kategorifilter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <div className="flex-1">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          <Suspense>
            <CategoryFilter active={activeCategory ?? "all"} />
          </Suspense>
        </div>

        <RecipeFeed
          recipes={recipes}
          showAuthor={!!user}
          emptySubMessage={emptySubMessage}
        />
      </div>
    </main>
  );
}
