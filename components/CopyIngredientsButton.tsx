"use client";

import { useState } from "react";

export default function CopyIngredientsButton({
  ingredients,
}: {
  ingredients: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(ingredients);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors"
    >
      {copied ? "Kopiert!" : "Kopier handleliste"}
    </button>
  );
}
