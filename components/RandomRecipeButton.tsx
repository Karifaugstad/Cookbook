"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Recipe {
  title: string;
  slug: string;
}

export default function RandomRecipeButton({
  recipes,
}: {
  recipes: Recipe[];
}) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [displayed, setDisplayed] = useState<Recipe | null>(null);
  const [winner, setWinner] = useState<Recipe | null>(null);
  const router = useRouter();

  function spin() {
    if (spinning || recipes.length < 2) return;
    setWinner(null);
    setSpinning(true);

    const chosen = recipes[Math.floor(Math.random() * recipes.length)];
    let delay = 40;
    let elapsed = 0;
    const duration = 3200;

    function tick() {
      const r = recipes[Math.floor(Math.random() * recipes.length)];
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
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(spin, 100); }}
        className="group flex items-center gap-3 w-full border border-border hover:border-primary px-5 py-4 transition-colors text-left"
      >
        <span className="text-3xl group-hover:animate-spin" style={{ display: "inline-block", animationDuration: "1s" }}>🎲</span>
        <div>
          <p className="font-bold text-sm">Vet du ikke hva du skal lage?</p>
          <p className="text-xs text-muted">La skjebnen bestemme</p>
        </div>
        <span className="ml-auto text-muted text-xs uppercase tracking-widest">→</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="w-full max-w-md text-center">
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-6 right-6 text-muted hover:text-primary text-2xl leading-none"
            >
              ×
            </button>

            {!winner ? (
              <>
                <div className="text-6xl mb-6 animate-bounce">🎲</div>
                <p className="text-xs uppercase tracking-widest text-muted mb-4">
                  {spinning ? "Spinner..." : "Klar!"}
                </p>
                <div
                  className="border border-border px-6 py-8 min-h-[100px] flex items-center justify-center"
                  style={{
                    transition: spinning ? "none" : "all 0.3s",
                  }}
                >
                  <p
                    className="font-bold text-2xl"
                    style={{
                      opacity: spinning ? 0.7 : 1,
                      filter: spinning ? "blur(1px)" : "none",
                      transition: "filter 0.1s",
                    }}
                  >
                    {displayed?.title ?? "..."}
                  </p>
                </div>
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
                    onClick={() => { setWinner(null); setDisplayed(null); setTimeout(spin, 100); }}
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
