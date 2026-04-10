import Link from "next/link";
import Image from "next/image";
import { getAllRecipesAdmin, deleteRecipe } from "@/lib/recipes";
import { getSupabaseImageUrl } from "@/lib/utils";
import DeleteRecipeButton from "@/components/admin/DeleteRecipeButton";

export default async function AdminPage() {
  const recipes = await getAllRecipesAdmin();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Alle oppskrifter</h1>

      {recipes.length === 0 ? (
        <div className="text-center py-20 text-muted border border-dashed border-border">
          <p className="font-serif text-xl mb-2">Ingen oppskrifter ennå.</p>
          <Link
            href="/admin/new"
            className="text-sm text-primary hover:underline"
          >
            Legg til din første oppskrift →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-b border-border">
          {recipes.map((recipe) => {
            const firstPhoto = recipe.recipe_photos
              ?.sort((a, b) => a.sort_order - b.sort_order)
              .at(0);

            return (
              <div
                key={recipe.id}
                className="flex items-center gap-4 py-4"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-border relative flex-shrink-0 overflow-hidden">
                  {firstPhoto ? (
                    <Image
                      src={getSupabaseImageUrl(firstPhoto.storage_key)}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-lg">
                      ✦
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{recipe.title}</p>
                  <p className="text-xs text-muted">
                    {{"breakfast":"Frokost","lunch":"Lunsj","dinner":"Middag"}[recipe.category] ?? recipe.category}
                    {!recipe.published && (
                      <span className="ml-2 text-primary">(utkast)</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    target="_blank"
                    className="text-xs text-muted hover:text-primary transition-colors"
                  >
                    Vis
                  </Link>
                  <Link
                    href={`/admin/${recipe.slug}/edit`}
                    className="text-xs text-muted hover:text-primary transition-colors"
                  >
                    Rediger
                  </Link>
                  <DeleteRecipeButton id={recipe.id} title={recipe.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
