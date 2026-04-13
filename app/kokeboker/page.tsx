import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/AppNav";
import RecipeFeed from "@/components/RecipeFeed";
import RandomRecipeButton from "@/components/RandomRecipeButton";
import CreateCookbookForm from "@/components/cookbooks/CreateCookbookForm";
import { getCollectedRecipesForUser, getCookbooksForUser } from "@/lib/cookbooks";
import CookbookCover from "@/components/cookbooks/CookbookCover";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CookbooksPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab = tab === "lagret" ? "lagret" : "bokhylle";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [cookbooks, collectedRecipes] = await Promise.all([
    getCookbooksForUser(user.id),
    getCollectedRecipesForUser(user.id),
  ]);

  return (
    <main className="min-h-screen">
      <AppNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Kokebøker</h1>
        <p className="text-sm text-muted mb-6">
          Samle egne og lagrede oppskrifter i dine egne bøker.
        </p>

        <div className="flex gap-2 mb-8">
          <Link
            href="/kokeboker"
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              activeTab === "bokhylle"
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary"
            }`}
          >
            Bokhylle
          </Link>
          <Link
            href="/kokeboker?tab=lagret"
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              activeTab === "lagret"
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary"
            }`}
          >
            Alle lagrede oppskrifter
          </Link>
        </div>

        {activeTab === "bokhylle" ? (
          <section>
            <div className="mb-6 flex justify-end">
              <CreateCookbookForm currentUserId={user.id} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase tracking-widest text-muted">Mine kokebøker</h2>
              <span className="text-xs text-muted">{cookbooks.length} stk</span>
            </div>
            {cookbooks.length === 0 ? (
              <p className="text-sm text-muted border border-border p-4">
                Du har ingen kokebøker ennå.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cookbooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/kokeboker/${book.id}`}
                    className="border border-border hover:border-primary transition-colors overflow-hidden"
                  >
                    <CookbookCover title={book.title} coverStorageKey={book.cover_storage_key} />
                    <div className="p-4">
                      <p className="font-bold mb-1">{book.title}</p>
                      <p className="text-xs text-muted">
                        {book.recipe_count} {book.recipe_count === 1 ? "oppskrift" : "oppskrifter"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            {collectedRecipes.length >= 2 && (
              <div className="mb-6">
                <RandomRecipeButton
                  recipes={collectedRecipes.map((r) => ({
                    title: r.title,
                    slug: r.slug,
                    category: r.category,
                  }))}
                />
              </div>
            )}
            <RecipeFeed
              recipes={collectedRecipes}
              showAuthor
              emptyMessage="Ingen lagrede oppskrifter ennå."
              emptySubMessage="Legg oppskrifter i en kokebok fra oppskriftssiden."
            />
          </section>
        )}
      </div>
    </main>
  );
}
