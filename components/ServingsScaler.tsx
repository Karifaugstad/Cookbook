"use client";

import { useState } from "react";

function scaleIngredients(text: string, multiplier: number): string {
  if (multiplier === 1) return text;
  return text.replace(/(\d+([.,]\d+)?)/g, (match) => {
    const num = parseFloat(match.replace(",", "."));
    const scaled = num * multiplier;
    // Show as integer if clean, otherwise 1 decimal
    const result = Math.round(scaled * 10) / 10;
    return result % 1 === 0 ? String(result) : result.toFixed(1).replace(".", ",");
  });
}

export default function ServingsScaler({
  originalServings,
  ingredients,
}: {
  originalServings: number;
  ingredients: string;
}) {
  const [servings, setServings] = useState(originalServings);
  const multiplier = servings / originalServings;
  const scaled = scaleIngredients(ingredients, multiplier);

  return (
    <div>
      {/* Servings control */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="w-7 h-7 border border-border hover:border-primary flex items-center justify-center text-lg leading-none transition-colors"
        >
          −
        </button>
        <span className="text-sm min-w-[80px] text-center">
          {servings} {servings === 1 ? "porsjon" : "porsjoner"}
        </span>
        <button
          onClick={() => setServings(servings + 1)}
          className="w-7 h-7 border border-border hover:border-primary flex items-center justify-center text-lg leading-none transition-colors"
        >
          +
        </button>
        {servings !== originalServings && (
          <button
            onClick={() => setServings(originalServings)}
            className="text-xs text-muted hover:text-primary underline underline-offset-2 transition-colors"
          >
            Tilbakestill
          </button>
        )}
      </div>

      <pre className="whitespace-pre-wrap text-sm leading-7 font-sans text-foreground">
        {scaled}
      </pre>
    </div>
  );
}
