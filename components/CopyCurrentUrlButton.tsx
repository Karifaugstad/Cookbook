"use client";

import { useState } from "react";

export default function CopyCurrentUrlButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
    >
      {copied ? "Lenke kopiert!" : "Kopier lenke"}
    </button>
  );
}
