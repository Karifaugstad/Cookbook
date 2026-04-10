"use client";

import { useState } from "react";
import type { Nutrition } from "@/lib/types";

export default function NutritionInfo({
  recipeId,
  ingredients,
  initial,
}: {
  recipeId: string;
  ingredients: string;
  initial: Nutrition | null;
}) {
  const [nutrition, setNutrition] = useState<Nutrition | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNutrition() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, ingredients }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNutrition(data);
    } catch {
      setError("Klarte ikke hente næringsinnhold. Sjekk at API-nøkkelen er satt.");
    } finally {
      setLoading(false);
    }
  }

  if (!nutrition) {
    return (
      <div>
        <button
          onClick={fetchNutrition}
          disabled={loading}
          className="text-sm border border-border hover:border-primary px-4 py-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Beregner..." : "Beregn næringsinnhold"}
        </button>
        {error && <p className="text-xs text-muted mt-2">{error}</p>}
      </div>
    );
  }

  const stats = [
    { label: "Kalorier", value: `${nutrition.calories} kcal` },
    { label: "Protein", value: `${nutrition.protein_g} g` },
    { label: "Karbohydrater", value: `${nutrition.carbs_g} g` },
    { label: "Fett", value: `${nutrition.fat_g} g` },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-border p-3 text-center">
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className="font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>
      <button
        onClick={fetchNutrition}
        disabled={loading}
        className="text-xs text-muted hover:text-primary underline underline-offset-2 mt-2 transition-colors"
      >
        {loading ? "Oppdaterer..." : "Oppdater"}
      </button>
    </div>
  );
}
