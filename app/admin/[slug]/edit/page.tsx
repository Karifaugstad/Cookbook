import { notFound } from "next/navigation";
import { getRecipeBySlugAdmin } from "@/lib/recipes";
import RecipeForm from "@/components/admin/RecipeForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlugAdmin(slug);
  if (!recipe) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Rediger oppskrift</h1>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
