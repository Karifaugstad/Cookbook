import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/AppNav";
import RecipeFeed from "@/components/RecipeFeed";
import { getCookbookByIdForUser, getCookbookRecipesForUser } from "@/lib/cookbooks";
import DeleteCookbookButton from "@/components/cookbooks/DeleteCookbookButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CookbookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [cookbook, recipes] = await Promise.all([
    getCookbookByIdForUser(user.id, id),
    getCookbookRecipesForUser(user.id, id),
  ]);

  if (!cookbook) notFound();

  return (
    <main className="min-h-screen">
      <AppNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/kokeboker" className="text-sm text-muted hover:text-primary transition-colors">
          ← Tilbake til kokebøker
        </Link>

        <div className="mt-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{cookbook.title}</h1>
              <p className="text-sm text-muted mt-1">
                {recipes.length} {recipes.length === 1 ? "oppskrift" : "oppskrifter"}
              </p>
            </div>
            <DeleteCookbookButton cookbookId={cookbook.id} />
          </div>
        </div>

        <RecipeFeed
          recipes={recipes}
          showAuthor
          emptyMessage="Ingen oppskrifter i denne kokeboken ennå."
          emptySubMessage="Legg til fra en oppskrift via knappen 'Legg til i kokebok'."
        />
      </div>
    </main>
  );
}
