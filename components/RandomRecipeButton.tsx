"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

interface Recipe {
  title: string;
  slug: string;
  category: string;
}

const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "breakfast", label: "Frokost" },
  { value: "lunch", label: "Lunsj" },
  { value: "dinner", label: "Middag" },
];

interface RandomRecipeButtonProps {
  recipes: Recipe[];
  activeCategory?: Category;
}

export default function RandomRecipeButton({
  recipes,
  activeCategory,
}: RandomRecipeButtonProps) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [displayed, setDisplayed] = useState<Recipe | null>(null);
  const [winner, setWinner] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    activeCategory ?? "all"
  );
  const router = useRouter();

  const pool =
    selectedCategory === "all"
      ? recipes
      : recipes.filter((r) => r.category === selectedCategory);

  function spin() {
    if (spinning || pool.length < 2) return;
    setWinner(null);
    setSpinning(true);

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    let delay = 40;
    let elapsed = 0;
    const duration = 3200;

    function tick() {
      const r = pool[Math.floor(Math.random() * pool.length)];
      setDisplayed(r);
      elapsed += delay;
      delay = 40 + Math.pow(elapsed / duration, 2) * 400;
      if (elapsed >= duration) {
        setDisplayed(chosen);
        setWinner(chosen);
        setSpinning(false);
      } else {
        setTimeout(tick, delay);
      }
    }
    tick();
  }

  function close() {
    setOpen(false);
    setWinner(null);
    setDisplayed(null);
    setSpinning(false);
  }

  if (recipes.length < 2) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 w-full border border-border hover:border-primary px-5 py-4 transition-colors text-left"
      >
        <span
          className="text-3xl group-hover:animate-spin"
          style={{ display: "inline-block", animationDuration: "1s" }}
        >
          🎲
        </span>
        <div>
          <p className="font-bold text-sm">Vet du ikke hva du skal lage?</p>
          <p className="text-xs text-muted">La skjebnen bestemme</p>
        </div>
        <span className="ml-auto text-muted text-xs uppercase tracking-widest">
          →
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-md text-center">
            <button
              onClick={close}
              className="absolute top-6 right-6 text-muted hover:text-primary text-2xl leading-none"
            >
              ×
            </button>

            {!winner ? (
              <>
                <div className="text-6xl mb-6 animate-bounce">🎲</div>

                {/* Kategorivelger */}
                {!spinning && (
                  <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {CATEGORIES.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedCategory(value)}
                        className={`px-4 py-1.5 text-sm border transition-colors ${
                          selectedCategory === value
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {spinning ? (
                  <>
                    <p className="text-xs uppercase tracking-widest text-muted mb-4">
                      Spinner...
                    </p>
                    <div className="border border-border px-6 py-8 min-h-[100px] flex items-center justify-center">
                      <p
                        className="font-bold text-2xl"
                        style={{ opacity: 0.7, filter: "blur(1px)" }}
                      >
                        {displayed?.title ?? "..."}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {pool.length < 2 ? (
                      <p className="text-sm text-muted mb-4">
                        For få oppskrifter i denne kategorien.
                      </p>
                    ) : (
                      <button
                        onClick={spin}
                        className="mt-2 bg-primary text-white px-8 py-3 font-bold hover:bg-primary-dark transition-colors text-sm uppercase tracking-widest"
                      >
                        Spin!
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="text-7xl mb-4">🎉</div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2">
                  I dag skal du lage
                </p>
                <h2 className="font-bold text-4xl mb-8 leading-tight">
                  {winner.title}
                </h2>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push(`/recipes/${winner.slug}`)}
                    className="bg-primary text-white px-6 py-3 font-bold hover:bg-primary-dark transition-colors"
                  >
                    Se oppskriften →
                  </button>
                  <button
                    onClick={() => {
                      setWinner(null);
                      setDisplayed(null);
                      setTimeout(spin, 100);
                    }}
                    className="border border-border px-6 py-3 hover:border-primary transition-colors text-sm"
                  >
                    Prøv igjen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
