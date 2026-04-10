import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { recipeId, ingredients } = await request.json();

  const apiKey = process.env.CALORIENINJAS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(ingredients)}`,
      { headers: { "X-Api-Key": apiKey } }
    );
    const json = await res.json();
    const items: {
      calories: number;
      protein_g: number;
      fat_total_g: number;
      carbohydrates_total_g: number;
    }[] = json.items ?? [];

    const nutrition = {
      calories: Math.round(items.reduce((s, i) => s + i.calories, 0)),
      protein_g: Math.round(items.reduce((s, i) => s + i.protein_g, 0) * 10) / 10,
      fat_g: Math.round(items.reduce((s, i) => s + i.fat_total_g, 0) * 10) / 10,
      carbs_g: Math.round(items.reduce((s, i) => s + i.carbohydrates_total_g, 0) * 10) / 10,
    };

    // Save to DB
    const supabase = await createClient();
    await supabase.from("recipes").update({ nutrition }).eq("id", recipeId);

    return NextResponse.json(nutrition);
  } catch {
    return NextResponse.json({ error: "Failed to fetch nutrition" }, { status: 500 });
  }
}
